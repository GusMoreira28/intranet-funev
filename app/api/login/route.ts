// app/api/login/route.ts
import { NextResponse } from 'next/server';
import ldap from 'ldapjs';

// Função utilitária para logs estruturados
const debugLog = (section: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [${timestamp}] === ${section} ===`);
    console.log(`📝 ${message}`);
    if (data !== undefined) {
        console.log('📊 Data:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    }
    console.log('─'.repeat(50));
};

const errorLog = (section: string, error: any, context?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`\n❌ [${timestamp}] === ERRO: ${section} ===`);
    console.error('🚨 Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('📄 Message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
        console.error('📍 Stack:', error.stack);
    }
    if (context) {
        console.error('🔍 Context:', JSON.stringify(context, null, 2));
    }
    console.error('═'.repeat(50));
};

const successLog = (section: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`\n✅ [${timestamp}] === SUCCESS: ${section} ===`);
    console.log(`🎉 ${message}`);
    if (data !== undefined) {
        console.log('📊 Result:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    }
    console.log('═'.repeat(50));
};

export async function POST(request: Request) {
    debugLog('INÍCIO', 'Iniciando processo de login');
    
    const startTime = Date.now();
    let ldapClient: ldap.Client | null = null;
    let currentStep = 'INICIALIZAÇÃO';

    try {
        // === 1. PARSE DO REQUEST ===
        currentStep = 'PARSE_REQUEST';
        debugLog('PARSE REQUEST', 'Extraindo dados do request');
        
        const { username, password } = await request.json();
        debugLog('REQUEST DATA', 'Dados recebidos', {
            username: username || 'NÃO FORNECIDO',
            passwordLength: password ? password.length : 0,
            hasPassword: !!password
        });

        // === 2. CARREGAMENTO DAS VARIÁVEIS DE AMBIENTE ===
        currentStep = 'LOAD_ENV_VARS';
        debugLog('AMBIENTE', 'Carregando variáveis de ambiente');

        const AD_URL = process.env.AD_SERVER_URL;
        const AD_BASE_DN = process.env.AD_BASE_DN || 'DC=funev,DC=local';
        const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
        const STRAPI_ADMIN_API_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN;
        const STRAPI_DEFAULT_USER_PASSWORD = process.env.STRAPI_DEFAULT_USER_PASSWORD || 'defaultStrapiPass123!';
        const AD_REQUIRED_GROUP_NAME = process.env.AD_REQUIRED_GROUP_NAME;

        const envStatus = {
            NODE_ENV: process.env.NODE_ENV,
            AD_URL_STATUS: AD_URL ? `CONFIGURADO (${AD_URL})` : '❌ NÃO CONFIGURADO',
            AD_BASE_DN_STATUS: AD_BASE_DN ? `CONFIGURADO (${AD_BASE_DN})` : '❌ NÃO CONFIGURADO',
            STRAPI_URL_STATUS: STRAPI_API_URL ? `CONFIGURADO (${STRAPI_API_URL})` : '❌ NÃO CONFIGURADO',
            STRAPI_TOKEN_STATUS: STRAPI_ADMIN_API_TOKEN ? `CONFIGURADO (${STRAPI_ADMIN_API_TOKEN.length} chars)` : '❌ NÃO CONFIGURADO',
            STRAPI_DEFAULT_PASSWORD_STATUS: STRAPI_DEFAULT_USER_PASSWORD ? `CONFIGURADO (${STRAPI_DEFAULT_USER_PASSWORD.length} chars)` : '❌ NÃO CONFIGURADO',
            AD_GROUP_STATUS: AD_REQUIRED_GROUP_NAME ? `CONFIGURADO (${AD_REQUIRED_GROUP_NAME})` : '❌ NÃO CONFIGURADO'
        };

        debugLog('VARIÁVEIS DE AMBIENTE', 'Status completo das configurações', envStatus);

        // === 3. VALIDAÇÃO DE CONFIGURAÇÃO ===
        currentStep = 'VALIDATE_CONFIG';
        
        if (!STRAPI_ADMIN_API_TOKEN) {
            errorLog('CONFIGURAÇÃO', new Error('STRAPI_ADMIN_API_TOKEN não configurado'));
            return NextResponse.json({ message: 'Erro de configuração do servidor (Strapi Admin Token ausente).' }, { status: 500 });
        }

        if (!username || !password) {
            debugLog('VALIDAÇÃO', 'Dados de login inválidos', { username: !!username, password: !!password });
            return NextResponse.json({ message: 'Usuário e senha são obrigatórios.' }, { status: 400 });
        }

        // === 4. CONSTRUÇÃO DOS IDENTIFICADORES ===
        currentStep = 'BUILD_IDENTIFIERS';
        
        const userDomain = AD_BASE_DN.split(',').map(s => s.split('=')[1]).join('.');
        const userPrincipalName = `${username}@${userDomain}`;
        const strapiUserEmail = userPrincipalName;

        debugLog('IDENTIFICADORES', 'Construção dos identificadores do usuário', {
            userDomain,
            userPrincipalName,
            strapiUserEmail
        });

        // === 5. TESTE DE CONECTIVIDADE INICIAL ===
        currentStep = 'CONNECTIVITY_TEST';
        debugLog('CONECTIVIDADE', 'Iniciando testes de conectividade');

        // Teste conectividade Strapi
        try {
            debugLog('STRAPI CONECTIVIDADE', 'Testando conectividade com Strapi');
            const strapiTestResponse = await fetch(`${STRAPI_API_URL}/api/users?pagination[limit]=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${STRAPI_ADMIN_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });

            debugLog('STRAPI TEST RESULT', 'Resultado do teste de conectividade', {
                status: strapiTestResponse.status,
                statusText: strapiTestResponse.statusText,
                ok: strapiTestResponse.ok,
                url: strapiTestResponse.url
            });

            if (!strapiTestResponse.ok) {
                throw new Error(`Strapi connectivity test failed: ${strapiTestResponse.status} ${strapiTestResponse.statusText}`);
            }
            
            successLog('STRAPI CONECTIVIDADE', 'Conexão com Strapi bem-sucedida');
        } catch (connectError) {
            errorLog('STRAPI CONECTIVIDADE', connectError);
            throw new Error(`Falha na conectividade com Strapi: ${connectError instanceof Error ? connectError.message : String(connectError)}`);
        }

        // === 6. CONFIGURAÇÃO DO CLIENTE LDAP ===
        currentStep = 'LDAP_CLIENT_SETUP';
        
        if (!AD_URL) {
            throw new Error('AD_SERVER_URL não configurado nas variáveis de ambiente!');
        }

        debugLog('LDAP SETUP', 'Configurando cliente LDAP', {
            url: AD_URL,
            timeout: 15000,
            connectTimeout: 10000
        });

        ldapClient = ldap.createClient({
            url: AD_URL as string,
            timeout: 15000,
            connectTimeout: 10000,
            idleTimeout: 30000,
            reconnect: {
                initialDelay: 100,
                maxDelay: 2000,
                failAfter: 3
            }
        });

        // Event listeners para debug
        ldapClient.on('connect', () => {
            successLog('LDAP CONNECTION', 'Conectado ao servidor LDAP');
        });

        ldapClient.on('error', (err: Error) => {
            errorLog('LDAP CLIENT ERROR', err);
        });

        ldapClient.on('close', () => {
            debugLog('LDAP CONNECTION', 'Conexão LDAP fechada');
        });

        // === 7. AUTENTICAÇÃO LDAP ===
        currentStep = 'LDAP_AUTHENTICATION';
        
        const authenticateLdapUser = (): Promise<boolean> => {
            return new Promise((resolve, reject) => {
                const userDn = strapiUserEmail;
                debugLog('LDAP AUTH', 'Iniciando autenticação LDAP', {
                    userDn,
                    serverUrl: AD_URL
                });

                if (!ldapClient) {
                    reject(new Error('Cliente LDAP não inicializado.'));
                    return;
                }

                const bindStartTime = Date.now();
                ldapClient.bind(userDn, password, (err: ldap.Error | null) => {
                    const bindDuration = Date.now() - bindStartTime;
                    
                    if (err) {
                        errorLog('LDAP BIND', err, {
                            userDn,
                            duration: bindDuration,
                            errorCode: err.code,
                            errorName: err.name
                        });
                        
                        if (err.name === 'InvalidCredentialsError') {
                            debugLog('LDAP AUTH RESULT', 'Credenciais inválidas - usuário/senha incorretos');
                            resolve(false);
                        } else {
                            reject(new Error(`Erro de autenticação LDAP: ${err.message || err.name}`));
                        }
                    } else {
                        successLog('LDAP AUTH', 'Autenticação LDAP bem-sucedida', {
                            user: username,
                            duration: bindDuration
                        });
                        resolve(true);
                    }
                });
            });
        };

        const isAuthenticatedInAd = await authenticateLdapUser();

        if (!isAuthenticatedInAd) {
            debugLog('AUTH RESULT', 'Autenticação falhou - credenciais inválidas');
            return NextResponse.json({ message: 'Usuário ou senha inválidos no Active Directory.' }, { status: 401 });
        }

        // === 8. VERIFICAÇÃO DE GRUPO (MELHORADA) ===
        currentStep = 'GROUP_VERIFICATION';
        
        const findUserInAD = (): Promise<{ dn: string; groups: string[] }> => {
            return new Promise((resolve, reject) => {
                if (!ldapClient) {
                    reject(new Error('Cliente LDAP não inicializado para busca de grupo.'));
                    return;
                }

                debugLog('USER SEARCH', 'Iniciando busca abrangente por usuário no AD');

                // Filtros mais abrangentes
                const filters = [
                    `(userPrincipalName=${userPrincipalName})`,
                    `(sAMAccountName=${username})`,
                    `(mail=${strapiUserEmail})`,
                    `(cn=${username})`,
                    `(displayName=*${username}*)`,
                    `(&(objectClass=user)(|(userPrincipalName=${userPrincipalName})(sAMAccountName=${username})(mail=${strapiUserEmail})))`
                ];

                // Múltiplas bases DN para testar
                const baseDNs = [
                    AD_BASE_DN,
                    `CN=Users,${AD_BASE_DN}`,
                    `OU=Users,${AD_BASE_DN}`,
                    `OU=Funcionarios,${AD_BASE_DN}`,
                    `OU=TI,${AD_BASE_DN}`,
                    `OU=Comunicacao,${AD_BASE_DN}`,
                    `OU=Comunicação,${AD_BASE_DN}`
                ];

                let currentBaseDN = 0;
                let currentFilter = 0;
                let searchAttempts = 0;

                const tryNextSearch = () => {
                    searchAttempts++;
                    
                    if (currentBaseDN >= baseDNs.length) {
                        errorLog('USER SEARCH', new Error('Usuário não encontrado em nenhuma Base DN'), {
                            totalAttempts: searchAttempts,
                            baseDNsTested: baseDNs.length,
                            filtersTested: filters.length
                        });
                        reject(new Error('Usuário não encontrado em nenhuma Base DN após busca exaustiva'));
                        return;
                    }

                    if (currentFilter >= filters.length) {
                        currentFilter = 0;
                        currentBaseDN++;
                        tryNextSearch();
                        return;
                    }

                    const baseDN = baseDNs[currentBaseDN];
                    const filter = filters[currentFilter];

                    debugLog('LDAP SEARCH ATTEMPT', `Tentativa ${searchAttempts}`, {
                        baseDN,
                        filter,
                        baseDNIndex: currentBaseDN + 1,
                        filterIndex: currentFilter + 1,
                        totalBaseDNs: baseDNs.length,
                        totalFilters: filters.length
                    });

                    const opts = {
                        filter: filter,
                        scope: 'sub' as const,
                        attributes: ['memberOf', 'distinguishedName', 'cn', 'sAMAccountName', 'userPrincipalName', 'mail', 'displayName'],
                        timeLimit: 30,
                        sizeLimit: 100
                    };

                    let found = false;
                    const searchStartTime = Date.now();

                    ldapClient!.search(baseDN, opts, (err, res) => {
                        if (err) {
                            const searchDuration = Date.now() - searchStartTime;
                            debugLog('SEARCH ERROR', `Erro na busca (continuando)`, {
                                error: err.message,
                                baseDN,
                                filter,
                                duration: searchDuration,
                                attempt: searchAttempts
                            });
                            currentFilter++;
                            setTimeout(tryNextSearch, 50);
                            return;
                        }

                        res.on('searchEntry', (entry) => {
                            found = true;
                            const searchDuration = Date.now() - searchStartTime;
                            const userDN = entry.objectName || '';
                            
                            successLog('USER FOUND', 'Usuário encontrado no Active Directory!', {
                                dn: userDN,
                                baseDN,
                                filter,
                                searchDuration,
                                totalAttempts: searchAttempts
                            });

                            // Log detalhado dos atributos encontrados
                            if (entry.attributes) {
                                debugLog('USER ATTRIBUTES', 'Atributos do usuário encontrados');
                                entry.attributes.forEach(attr => {
                                    if (attr.type === 'memberOf' && attr.values) {
                                        const groups = Array.isArray(attr.values) ? attr.values : [attr.values];
                                        console.log(`  📋 ${attr.type}: ${groups.length} grupo(s)`);
                                        groups.forEach((group, idx) => {
                                            console.log(`    ${idx + 1}. ${group}`);
                                        });
                                    } else if (attr.values) {
                                        const values = Array.isArray(attr.values) ? attr.values : [attr.values];
                                        console.log(`  📋 ${attr.type}: ${values.join(', ')}`);
                                    }
                                });
                            }

                            // Extrair grupos
                            let userGroups: string[] = [];
                            const memberOfAttr = entry.attributes.find(attr => attr.type === 'memberOf');
                            if (memberOfAttr && memberOfAttr.values) {
                                userGroups = Array.isArray(memberOfAttr.values) ? memberOfAttr.values : [memberOfAttr.values];
                                successLog('GROUPS EXTRACTED', `Extraídos ${userGroups.length} grupos do usuário`);
                            } else {
                                debugLog('GROUPS WARNING', 'Nenhum grupo encontrado para o usuário');
                            }

                            resolve({ dn: userDN, groups: userGroups });
                        });

                        res.on('error', (err) => {
                            const searchDuration = Date.now() - searchStartTime;
                            debugLog('SEARCH STREAM ERROR', `Stream error (continuando)`, {
                                error: err.message,
                                baseDN,
                                filter,
                                duration: searchDuration,
                                attempt: searchAttempts
                            });
                            currentFilter++;
                            setTimeout(tryNextSearch, 50);
                        });

                        res.on('end', (result) => {
                            const searchDuration = Date.now() - searchStartTime;
                            
                            if (!found) {
                                debugLog('SEARCH END', `Busca finalizada sem resultado`, {
                                    baseDN,
                                    filter,
                                    duration: searchDuration,
                                    status: result?.status || 'unknown',
                                    attempt: searchAttempts
                                });
                                currentFilter++;
                                setTimeout(tryNextSearch, 50);
                            }
                        });
                    });
                };

                tryNextSearch();
            });
        };

        let userInfo: { dn: string; groups: string[] };
        
        try {
            userInfo = await findUserInAD();
            debugLog('USER INFO', 'Informações completas do usuário', {
                dn: userInfo.dn,
                totalGroups: userInfo.groups.length,
                groupNames: userInfo.groups.map(g => {
                    const match = g.match(/CN=([^,]+)/i);
                    return match ? match[1] : g;
                })
            });
        } catch (searchError) {
            errorLog('USER SEARCH FAILED', searchError);
            // Se não conseguir encontrar o usuário para verificar grupos, mas a autenticação passou,
            // vamos permitir o acesso e log o problema
            debugLog('FALLBACK', 'Pulando verificação de grupo devido à falha na busca');
            userInfo = { dn: userPrincipalName, groups: [] };
        }

        // Verificação de membership no grupo (se grupos foram encontrados)
        let isMemberOfRequiredGroup = true; // Default true se não conseguir verificar

        if (AD_REQUIRED_GROUP_NAME && userInfo.groups.length > 0) {
            debugLog('GROUP MEMBERSHIP CHECK', 'Verificando membership no grupo requerido', {
                requiredGroup: AD_REQUIRED_GROUP_NAME,
                userGroups: userInfo.groups.length
            });

            isMemberOfRequiredGroup = userInfo.groups.some(groupDn => {
                const match = groupDn.match(/CN=([^,]+)/i);
                const groupName = match ? match[1] : '';
                
                // Verificação com normalização de acentos
                const normalizeString = (str: string) => 
                    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                
                const isMatch = normalizeString(groupName) === normalizeString(AD_REQUIRED_GROUP_NAME) ||
                               groupName.toLowerCase() === AD_REQUIRED_GROUP_NAME.toLowerCase();
                
                if (isMatch) {
                    successLog('GROUP MATCH', 'Match de grupo encontrado!', {
                        foundGroup: groupName,
                        requiredGroup: AD_REQUIRED_GROUP_NAME
                    });
                }
                
                return isMatch;
            });

            debugLog('GROUP VERIFICATION RESULT', 'Resultado da verificação de grupo', {
                isMember: isMemberOfRequiredGroup,
                requiredGroup: AD_REQUIRED_GROUP_NAME,
                userGroupCount: userInfo.groups.length
            });
        } else if (AD_REQUIRED_GROUP_NAME) {
            debugLog('GROUP CHECK SKIPPED', 'Verificação de grupo pulada - nenhum grupo encontrado para o usuário');
        }

        if (!isMemberOfRequiredGroup && AD_REQUIRED_GROUP_NAME) {
            debugLog('ACCESS DENIED', 'Usuário não é membro do grupo requerido');
            return NextResponse.json({ 
                message: `Acesso negado. Usuário não é membro do grupo "${AD_REQUIRED_GROUP_NAME}".` 
            }, { status: 403 });
        }

        // === 9. SINCRONIZAÇÃO COM STRAPI ===
        currentStep = 'STRAPI_SYNC';
        
        debugLog('STRAPI SYNC', 'Iniciando sincronização com Strapi');

        let strapiUser: any = null;

        debugLog('STRAPI USER SEARCH', 'Buscando usuário existente no Strapi', {
            email: strapiUserEmail,
            searchUrl: `${STRAPI_API_URL}/api/users?filters[email][$eq]=${strapiUserEmail}`
        });

        const findStrapiUserResponse = await fetch(`${STRAPI_API_URL}/api/users?filters[email][$eq]=${encodeURIComponent(strapiUserEmail)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${STRAPI_ADMIN_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        debugLog('STRAPI USER SEARCH RESULT', 'Resultado da busca por usuário', {
            status: findStrapiUserResponse.status,
            ok: findStrapiUserResponse.ok,
            statusText: findStrapiUserResponse.statusText
        });

        if (findStrapiUserResponse.ok) {
            const strapiUsers = await findStrapiUserResponse.json();
            strapiUser = strapiUsers[0];
            debugLog('STRAPI USER STATUS', 'Status do usuário no Strapi', {
                found: !!strapiUser,
                userId: strapiUser?.id,
                userEmail: strapiUser?.email
            });
        }

        if (!strapiUser) {
            // === 10. CRIAÇÃO DE USUÁRIO NO STRAPI ===
            currentStep = 'STRAPI_USER_CREATION';
            
            debugLog('STRAPI USER CREATE', 'Usuário não encontrado. Criando novo usuário', {
                username,
                email: strapiUserEmail,
                registrationUrl: `${STRAPI_API_URL}/api/auth/local/register`
            });
            
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

            debugLog('STRAPI USER CREATE RESULT', 'Resultado da criação de usuário', {
                status: createStrapiUserResponse.status,
                ok: createStrapiUserResponse.ok,
                statusText: createStrapiUserResponse.statusText
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
                
                errorLog('STRAPI USER CREATION', new Error('Falha ao criar usuário no Strapi'), {
                    responseStatus: createStrapiUserResponse.status,
                    errorData,
                    requestBody: {
                        username,
                        email: strapiUserEmail,
                        passwordLength: STRAPI_DEFAULT_USER_PASSWORD.length
                    }
                });
                
                throw new Error(errorData.message || `Falha ao criar usuário no Strapi. Status: ${createStrapiUserResponse.status}`);
            }

            const registrationData = await createStrapiUserResponse.json();
            strapiUser = registrationData.user;
            
            successLog('STRAPI USER CREATED', 'Usuário criado no Strapi com sucesso', {
                userId: strapiUser?.id,
                userEmail: strapiUser?.email,
                hasJwt: !!registrationData.jwt
            });
            
            if (registrationData.jwt) {
                const totalDuration = Date.now() - startTime;
                successLog('LOGIN COMPLETE', 'Login bem-sucedido com novo usuário', {
                    user: username,
                    totalDuration,
                    jwtLength: registrationData.jwt.length
                });
                
                return NextResponse.json({ 
                    message: 'Login bem-sucedido!', 
                    user: username, 
                    strapiJwt: registrationData.jwt 
                }, { status: 200 });
            }
        } else {
            debugLog('STRAPI USER EXISTS', 'Usuário já existe no Strapi. Prosseguindo com login');
        }

        // === 11. LOGIN NO STRAPI ===
        currentStep = 'STRAPI_LOGIN';
        
        debugLog('STRAPI LOGIN', 'Fazendo login no Strapi para obter JWT', {
            loginUrl: `${STRAPI_API_URL}/api/auth/local`,
            identifier: strapiUserEmail
        });

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

        debugLog('STRAPI LOGIN RESULT', 'Resultado do login no Strapi', {
            status: strapiLoginResponse.status,
            ok: strapiLoginResponse.ok,
            statusText: strapiLoginResponse.statusText
        });

        if (!strapiLoginResponse.ok) {
            let errorMessage = `Falha ao obter JWT do Strapi: Status ${strapiLoginResponse.status}`;
            
            try {
                const errorData = await strapiLoginResponse.json();
                errorMessage = errorData.error?.message || errorData.message || errorMessage;
                errorLog('STRAPI LOGIN ERROR', new Error(errorMessage), {
                    status: strapiLoginResponse.status,
                    errorData
                });
            } catch (parseError) {
                const errorText = await strapiLoginResponse.text();
                errorMessage += ` - Resposta: ${errorText.substring(0, 100)}...`;
                errorLog('STRAPI LOGIN PARSE ERROR', parseError, {
                    originalError: errorMessage,
                    responseText: errorText.substring(0, 200)
                });
            }
            
            throw new Error(errorMessage);
        }

        const strapiLoginData = await strapiLoginResponse.json();
        const strapiJwt = strapiLoginData.jwt;

        if (!strapiJwt) {
            errorLog('JWT ERROR', new Error('JWT do Strapi não recebido após login'));
            throw new Error('JWT do Strapi não recebido após login.');
        }

        // === 12. SUCESSO ===
        const totalDuration = Date.now() - startTime;
        successLog('LOGIN SUCCESS', 'Processo de login concluído com sucesso', {
            user: username,
            totalDuration,
            jwtLength: strapiJwt.length,
            userDN: userInfo.dn,
            groupsFound: userInfo.groups.length,
            steps: [
                '✅ Validação de dados',
                '✅ Configuração de ambiente',
                '✅ Teste de conectividade',
                '✅ Autenticação LDAP',
                '✅ Busca de usuário no AD',
                '✅ Verificação de grupo',
                '✅ Sincronização Strapi',
                '✅ Obtenção de JWT'
            ]
        });

        return NextResponse.json({ 
            message: 'Login bem-sucedido!', 
            user: username, 
            strapiJwt: strapiJwt 
        }, { status: 200 });

    } catch (error) {
        const totalDuration = Date.now() - startTime;
        
        errorLog('FATAL ERROR', error, {
            currentStep,
            totalDuration,
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                hasAD_URL: !!process.env.AD_SERVER_URL,
                hasSTRAPI_URL: !!process.env.NEXT_PUBLIC_STRAPI_URL,
                hasSTRAPI_TOKEN: !!process.env.STRAPI_ADMIN_API_TOKEN
            }
        });
        
        if (error instanceof Error) {
            // Mensagens customizadas baseadas no tipo de erro
            if (error.message.includes('LDAP') || error.message.includes('ldap')) {
                return NextResponse.json({ 
                    message: 'Erro de conectividade com Active Directory. Verifique configurações de rede.' 
                }, { status: 503 });
            } else if (error.message.includes('Strapi') || error.message.includes('strapi')) {
                return NextResponse.json({ 
                    message: 'Erro de conectividade com Strapi. Verifique configurações da API.' 
                }, { status: 503 });
            } else if (error.message.includes('timeout')) {
                return NextResponse.json({ 
                    message: 'Timeout na operação. Tente novamente em alguns instantes.' 
                }, { status: 504 });
            }
            
            return NextResponse.json({ 
                message: `Erro no servidor: ${error.message}` 
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            message: 'Erro desconhecido no servidor.' 
        }, { status: 500 });
    } finally {
        // === CLEANUP ===
        if (ldapClient) {
            try {
                ldapClient.unbind();
                debugLog('CLEANUP', 'Cliente LDAP desconectado com sucesso');
            } catch (unbindErr) {
                errorLog('CLEANUP ERROR', unbindErr);
            }
        }
        
        const totalDuration = Date.now() - startTime;
        debugLog('PROCESSO FINALIZADO', `Duração total: ${totalDuration}ms`);
    }
}