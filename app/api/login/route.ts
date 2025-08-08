// app/api/ad-login/route.ts
import { NextResponse } from 'next/server';
import ldap from 'ldapjs';

export async function POST(request: Request) {
    const { username, password } = await request.json();

    const AD_URL = process.env.AD_SERVER_URL || 'ldap://172.16.1.231:389'; // Usar LDAPS (porta 636) é CRUCIAL para segurança
    const AD_BASE_DN = process.env.AD_BASE_DN || 'DC=funev,DC=local'; // Exemplo: DC=dominio,DC=local
    const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL; // URL da sua API Strapi
    const STRAPI_ADMIN_API_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN; // Token de Admin do Strapi
    const STRAPI_DEFAULT_USER_PASSWORD = process.env.STRAPI_DEFAULT_USER_PASSWORD || 'defaultStrapiPass123!'; // Senha padrão no Strapi

    const AD_REQUIRED_GROUP_NAME = process.env.AD_REQUIRED_GROUP_NAME;

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


    try {
        // --- 1. AUTENTICAÇÃO NO ACTIVE DIRECTORY (LDAP) ---
        ldapClient = ldap.createClient({
            url: AD_URL,
            // tlsOptions: { rejectUnauthorized: false } // APENAS PARA DEBUG EM DESENVOLVIMENTO! REMOVER EM PRODUÇÃO!
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
                        resolve(true);
                    }
                });
            });
        };

        const isAuthenticatedInAd = await authenticateLdapUser();

        if (!isAuthenticatedInAd) {
            return NextResponse.json({ message: 'Usuário ou senha inválidos no Active Directory.' }, { status: 401 });
        }

        // // --- 2. VERIFICAÇÃO DE GRUPO NO ACTIVE DIRECTORY ---
        // const isUserInRequiredGroup = (): Promise<boolean> => {
        //     return new Promise((resolve, reject) => {
        //         if (!ldapClient) {
        //             reject(new Error('Cliente LDAP não inicializado para busca de grupo.'));
        //             return;
        //         }

        //         const opts = {
        //             filter: `(userPrincipalName=${userPrincipalName})`, // Busca o usuário pelo UPN
        //             scope: 'sub' as const, // Busca em sub-árvores
        //             attributes: ['memberOf'], // Pede o atributo memberOf
        //         };

        //         let userGroups: string[] = [];
        //         ldapClient.search(AD_BASE_DN, opts, (err, res) => {
        //             if (err) {
        //                 console.error(`LDAP Search Error for user ${username} groups:`, err);
        //                 reject(new Error(`Erro ao buscar grupos do AD: ${err.message || err.name}`));
        //                 return;
        //             }

        //             res.on('searchEntry', (entry) => {
        //                 if (entry.attributes && entry.attributes.length > 0) {
        //                     const memberOfAttr = entry.attributes.find(attr => attr.type === 'memberOf');
        //                     if (memberOfAttr && memberOfAttr.vals) {
        //                         userGroups = Array.isArray(memberOfAttr.vals) ? memberOfAttr.vals : [memberOfAttr.vals];
        //                     }
        //                 }
        //             });

        //             res.on('error', (err) => {
        //                 console.error(`LDAP Search Stream Error for user ${username} groups:`, err);
        //                 reject(new Error(`Erro no stream de busca LDAP: ${err.message || err.name}`));
        //             });

        //             res.on('end', (result) => {
        //                 if (!result || result.status !== 0) {
        //                     console.error(`LDAP Search non-zero status for user ${username} groups:`, result);
        //                     reject(new Error(`Busca de grupo LDAP finalizada com status ${result?.status}`));
        //                     return;
        //                 }

        //                 // Verifica se o usuário é membro do grupo necessário
        //                 const isMember = userGroups.some(groupDn => {
        //                     // O groupDn será algo como "CN=SeuGrupoDeTI,OU=Grupos,DC=suaempresa,DC=com"
        //                     // Precisamos extrair o nome do grupo e comparar com AD_REQUIRED_GROUP_NAME
        //                     const match = groupDn.match(/CN=([^,]+)/i);
        //                     const groupName = match ? match[1] : '';
        //                     return AD_REQUIRED_GROUP_NAME
        //                         ? groupName.toLowerCase() === AD_REQUIRED_GROUP_NAME.toLowerCase()
        //                         : false;
        //                 });

        //                 console.log(`Usuário ${username} é membro dos grupos:`, userGroups);
        //                 console.log(`Verificando se é membro de "${AD_REQUIRED_GROUP_NAME}":`, isMember);
        //                 resolve(isMember);
        //             });
        //         });
        //     });
        // };

        // const isMemberOfRequiredGroup = await isUserInRequiredGroup();

        // if (!isMemberOfRequiredGroup) {
        //     return NextResponse.json({ message: `Acesso negado. Usuário não é membro do grupo "${AD_REQUIRED_GROUP_NAME}".` }, { status: 403 });
        // }


        // --- 3. SINCRONIZAÇÃO/CRIAÇÃO DE USUÁRIO NO STRAPI ---
        let strapiUser: any = null;

        // Tenta encontrar o usuário no Strapi
        const findStrapiUserResponse = await fetch(`${STRAPI_API_URL}/users?filters[email][$eq]=${strapiUserEmail}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${STRAPI_ADMIN_API_TOKEN}`, // Usa o token Admin para buscar usuários
                'Content-Type': 'application/json',
            },
        });

        const strapiUsers = await findStrapiUserResponse.json();
        strapiUser = strapiUsers[0];

        if (!strapiUser) {
            // Se o usuário não existe no Strapi, cria um novo
            console.log(`Usuário ${username} não encontrado no Strapi. Criando...`);
            
            const createStrapiUserResponse = await fetch(`${STRAPI_API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${STRAPI_ADMIN_API_TOKEN}`, // Usa o token Admin para criar
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: strapiUserEmail,
                    password: STRAPI_DEFAULT_USER_PASSWORD, // Usa a senha padrão/gerada
                    confirmed: true,
                    role: 1, // ID do papel "Authenticated" no Strapi (geralmente 1 ou 2)
                }),
            });

            if (!createStrapiUserResponse.ok) {
                const errorData = await createStrapiUserResponse.json();
                console.error('Falha ao criar usuário no Strapi:', errorData);
                throw new Error(errorData.message || 'Falha ao criar usuário no Strapi.');
            }
            strapiUser = await createStrapiUserResponse.json();
            console.log(`Usuário ${username} criado no Strapi com senha padrão.`);
        } else {
            console.log(`Usuário ${username} já existe no Strapi. Tentando login com senha padrão...`);
            // Para usuários existentes, se a senha no Strapi não for a padrão, o login abaixo falhará.
            // Para uma solução mais robusta, você precisaria de um endpoint customizado no Strapi
            // que gere um JWT para um usuário autenticado via AD sem precisar da senha do Strapi.
        }

        // --- 3. LOGA NO STRAPI USANDO /api/auth/local PARA OBTER O JWT ---
        const strapiLoginResponse = await fetch(`${STRAPI_API_URL}/auth/local`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier: strapiUserEmail,
                password: STRAPI_DEFAULT_USER_PASSWORD, // Tenta logar com a senha padrão/gerada
            }),
        });

        if (!strapiLoginResponse.ok) {
            const errorText = await strapiLoginResponse.text();
            let errorMessage = `Falha ao obter JWT do Strapi via /auth/local: Status ${strapiLoginResponse.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
            } catch (parseError) {
                errorMessage += ` - Resposta: ${errorText.substring(0, 100)}...`;
            }
            console.error('Resposta de erro do Strapi /auth/local:', errorText);
            throw new Error(errorMessage);
        }

        const strapiLoginData = await strapiLoginResponse.json();
        const strapiJwt = strapiLoginData.jwt;

        if (!strapiJwt) {
            throw new Error('JWT do Strapi não recebido após login via /auth/local.');
        }

        return NextResponse.json({ message: 'Login bem-sucedido!', user: username, strapiJwt: strapiJwt }, { status: 200 });

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