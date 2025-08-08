// app/api/login/route.ts
import { NextResponse } from 'next/server';
import ldap from 'ldapjs';

export async function POST(request: Request) {
    const { username, password } = await request.json();

    const AD_URL = process.env.AD_SERVER_URL || 'ldap://172.16.1.231:389';
    const AD_BASE_DN = process.env.AD_BASE_DN || 'DC=funev,DC=local';
    const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
    const STRAPI_ADMIN_API_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN;
    const STRAPI_DEFAULT_USER_PASSWORD = process.env.STRAPI_DEFAULT_USER_PASSWORD || 'defaultStrapiPass123!';
    const AD_REQUIRED_GROUP_NAME = process.env.AD_REQUIRED_GROUP_NAME;

    // DEBUG: Log das variáveis de ambiente
    console.log('=== DEBUG CONFIGURAÇÃO ===');
    console.log('AD_REQUIRED_GROUP_NAME:', AD_REQUIRED_GROUP_NAME);
    console.log('AD_BASE_DN:', AD_BASE_DN);
    console.log('Username recebido:', username);

    if (!STRAPI_ADMIN_API_TOKEN) {
        console.error('STRAPI_ADMIN_API_TOKEN não configurado nas variáveis de ambiente!');
        return NextResponse.json({ message: 'Erro de configuração do servidor (Strapi Admin Token ausente).' }, { status: 500 });
    }

    if (!username || !password) {
        return NextResponse.json({ message: 'Usuário e senha são obrigatórios.' }, { status: 400 });
    }

    let ldapClient: ldap.Client | null = null;

    const userDomain = AD_BASE_DN.split(',').map(s => s.split('=')[1]).join('.');
    const userPrincipalName = `${username}@${userDomain}`;
    const strapiUserEmail = userPrincipalName;

    console.log('UserPrincipalName construído:', userPrincipalName);

    try {
        // --- 1. AUTENTICAÇÃO NO ACTIVE DIRECTORY (LDAP) ---
        ldapClient = ldap.createClient({
            url: AD_URL,
        });

        ldapClient.on('error', (err: Error) => {
            console.error('LDAP Client Error (connection/protocol):', err);
        });

        const authenticateLdapUser = (): Promise<boolean> => {
            return new Promise((resolve, reject) => {
                const userDn = strapiUserEmail;
                console.log('Tentando LDAP bind com DN:', userDn);

                if (!ldapClient) {
                    reject(new Error('Cliente LDAP não inicializado.'));
                    return;
                }

                ldapClient.bind(userDn, password, (err: ldap.Error | null) => {
                    if (err) {
                        console.error(`LDAP Bind Error for user ${username}:`, err);
                        if (err.name === 'InvalidCredentialsError') {
                            resolve(false);
                        } else {
                            reject(new Error(`Erro de autenticação LDAP: ${err.message || err.name}`));
                        }
                    } else {
                        console.log('✅ Autenticação LDAP bem-sucedida para:', username);
                        resolve(true);
                    }
                });
            });
        };

        const isAuthenticatedInAd = await authenticateLdapUser();

        if (!isAuthenticatedInAd) {
            return NextResponse.json({ message: 'Usuário ou senha inválidos no Active Directory.' }, { status: 401 });
        }

        // --- 2. VERIFICAÇÃO DE GRUPO NO ACTIVE DIRECTORY ---
        const isUserInRequiredGroup = (): Promise<boolean> => {
            return new Promise((resolve, reject) => {
                if (!ldapClient) {
                    reject(new Error('Cliente LDAP não inicializado para busca de grupo.'));
                    return;
                }

                // Tentar múltiplos filtros para encontrar o usuário
                const filters = [
                    `(userPrincipalName=${userPrincipalName})`,
                    `(sAMAccountName=${username})`,
                    `(&(objectClass=user)(|(userPrincipalName=${userPrincipalName})(sAMAccountName=${username})))`
                ];

                let attemptIndex = 0;

                const tryNextFilter = () => {
                    if (attemptIndex >= filters.length) {
                        console.error('❌ Nenhum filtro LDAP funcionou para encontrar o usuário');
                        resolve(false);
                        return;
                    }

                    const currentFilter = filters[attemptIndex];
                    console.log(`\n=== TENTATIVA ${attemptIndex + 1} ===`);
                    console.log('Filtro LDAP:', currentFilter);
                    console.log('Base DN:', AD_BASE_DN);

                    const opts = {
                        filter: currentFilter,
                        scope: 'sub' as const,
                        attributes: ['memberOf', 'distinguishedName', 'cn', 'sAMAccountName', 'userPrincipalName'],
                    };

                    let userGroups: string[] = [];
                    let foundUser = false;

                    ldapClient!.search(AD_BASE_DN, opts, (err, res) => {
                        if (err) {
                            console.error(`LDAP Search Error (tentativa ${attemptIndex + 1}):`, err);
                            attemptIndex++;
                            tryNextFilter();
                            return;
                        }

                        res.on('searchEntry', (entry) => {
                            foundUser = true;
                            console.log('✅ Usuário encontrado!');
                            console.log('DN do usuário:', entry.objectName);

                            if (entry.attributes && entry.attributes.length > 0) {
                                console.log('Atributos disponíveis:');
                                entry.attributes.forEach(attr => {
                                    console.log(`  - ${attr.type}: ${Array.isArray(attr.values) ? attr.values.length + ' valores' : 'valor único'}`);
                                });

                                const memberOfAttr = entry.attributes.find(attr => attr.type === 'memberOf');
                                if (memberOfAttr && memberOfAttr.values) {
                                    userGroups = Array.isArray(memberOfAttr.values) ? memberOfAttr.values : [memberOfAttr.values];
                                    console.log('✅ Grupos encontrados:', userGroups.length);
                                    userGroups.forEach((group, index) => {
                                        console.log(`  ${index + 1}. ${group}`);
                                    });
                                } else {
                                    console.log('⚠️  Atributo memberOf não encontrado ou vazio');
                                }
                            }
                        });

                        res.on('error', (err) => {
                            console.error(`LDAP Search Stream Error (tentativa ${attemptIndex + 1}):`, err);
                            attemptIndex++;
                            tryNextFilter();
                        });

                        res.on('end', (result) => {
                            if (!result || result.status !== 0) {
                                console.error(`LDAP Search status não-zero (tentativa ${attemptIndex + 1}):`, result?.status);
                                attemptIndex++;
                                tryNextFilter();
                                return;
                            }

                            if (!foundUser) {
                                console.log(`❌ Nenhum usuário encontrado com filtro ${attemptIndex + 1}`);
                                attemptIndex++;
                                tryNextFilter();
                                return;
                            }

                            // Verifica se o usuário é membro do grupo necessário
                            const isMember = userGroups.some(groupDn => {
                                const match = groupDn.match(/CN=([^,]+)/i);
                                const groupName = match ? match[1] : '';
                                const isMatch = AD_REQUIRED_GROUP_NAME
                                    ? groupName.toLowerCase() === AD_REQUIRED_GROUP_NAME.toLowerCase()
                                    : false;
                                
                                if (isMatch) {
                                    console.log(`✅ Match encontrado: "${groupName}" === "${AD_REQUIRED_GROUP_NAME}"`);
                                }
                                
                                return isMatch;
                            });

                            console.log(`\n=== RESULTADO FINAL ===`);
                            console.log(`Usuário ${username} é membro dos grupos:`, userGroups.map(g => {
                                const match = g.match(/CN=([^,]+)/i);
                                return match ? match[1] : g;
                            }));
                            console.log(`Verificando se é membro de "${AD_REQUIRED_GROUP_NAME}":`, isMember);
                            
                            resolve(isMember);
                        });
                    });
                };

                tryNextFilter();
            });
        };

        const isMemberOfRequiredGroup = await isUserInRequiredGroup();

        if (!isMemberOfRequiredGroup) {
            return NextResponse.json({ message: `Acesso negado. Usuário não é membro do grupo "${AD_REQUIRED_GROUP_NAME}".` }, { status: 403 });
        }

        // --- 3. SINCRONIZAÇÃO/CRIAÇÃO DE USUÁRIO NO STRAPI ---
        let strapiUser: any = null;

        const findStrapiUserResponse = await fetch(`${STRAPI_API_URL}/api/users?filters[email][$eq]=${strapiUserEmail}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${STRAPI_ADMIN_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (findStrapiUserResponse.ok) {
            const strapiUsers = await findStrapiUserResponse.json();
            strapiUser = strapiUsers[0];
        }

        if (!strapiUser) {
            console.log(`Usuário ${username} não encontrado no Strapi. Criando...`);
            
            const createStrapiUserResponse = await fetch(`${STRAPI_API_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: strapiUserEmail,
                    password: STRAPI_DEFAULT_USER_PASSWORD,
                }),
            });

            if (!createStrapiUserResponse.ok) {
                let errorData;
                const contentType = createStrapiUserResponse.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    errorData = await createStrapiUserResponse.json();
                } else {
                    const errorText = await createStrapiUserResponse.text();
                    errorData = { message: errorText };
                }
                
                console.error('Falha ao criar usuário no Strapi:', errorData);
                throw new Error(errorData.message || `Falha ao criar usuário no Strapi. Status: ${createStrapiUserResponse.status}`);
            }

            const registrationData = await createStrapiUserResponse.json();
            strapiUser = registrationData.user;
            
            console.log(`Usuário ${username} criado no Strapi com sucesso.`);
            
            if (registrationData.jwt) {
                return NextResponse.json({ 
                    message: 'Login bem-sucedido!', 
                    user: username, 
                    strapiJwt: registrationData.jwt 
                }, { status: 200 });
            }
        } else {
            console.log(`Usuário ${username} já existe no Strapi. Fazendo login...`);
        }

        // --- 4. LOGA NO STRAPI USANDO /api/auth/local PARA OBTER O JWT ---
        const strapiLoginResponse = await fetch(`${STRAPI_API_URL}/api/auth/local`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier: strapiUserEmail,
                password: STRAPI_DEFAULT_USER_PASSWORD,
            }),
        });

        if (!strapiLoginResponse.ok) {
            let errorMessage = `Falha ao obter JWT do Strapi: Status ${strapiLoginResponse.status}`;
            
            try {
                const errorData = await strapiLoginResponse.json();
                errorMessage = errorData.error?.message || errorData.message || errorMessage;
            } catch (parseError) {
                const errorText = await strapiLoginResponse.text();
                errorMessage += ` - Resposta: ${errorText.substring(0, 100)}...`;
            }
            
            console.error('Erro ao fazer login no Strapi:', errorMessage);
            throw new Error(errorMessage);
        }

        const strapiLoginData = await strapiLoginResponse.json();
        const strapiJwt = strapiLoginData.jwt;

        if (!strapiJwt) {
            throw new Error('JWT do Strapi não recebido após login.');
        }

        return NextResponse.json({ 
            message: 'Login bem-sucedido!', 
            user: username, 
            strapiJwt: strapiJwt 
        }, { status: 200 });

    } catch (error) {
        console.error('Erro na rota de API de login AD/Strapi:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: `Erro no servidor: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: 'Erro desconhecido no servidor.' }, { status: 500 });
    } finally {
        if (ldapClient) {
            try {
                ldapClient.unbind();
                console.log('LDAP client unbound.');
            } catch (unbindErr) {
                console.error('Error unbinding LDAP client:', unbindErr);
            }
        }
    }
}