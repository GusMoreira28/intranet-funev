// app/auth.ts
// Lógica de autenticação para Active Directory e Strapi JWT

const AD_LOGIN_API_ENDPOINT = '/api/login'; // Endpoint da sua API Route para login AD
const JWT_TOKEN_KEY = 'strapi_jwt_token'; // Chave para armazenar o JWT do Strapi

export const login = async (username: string, password: string) => {
    try {
        const response = await fetch(AD_LOGIN_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Falha no login AD');
        }

        // Se o login for bem-sucedido, a API Route retornará o JWT do Strapi
        const strapiJwt = data.strapiJwt;
        if (!strapiJwt) {
            throw new Error('JWT do Strapi não recebido da API de login.');
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(JWT_TOKEN_KEY, strapiJwt); // Armazena o JWT do Strapi
        }
        return data; // Retorna os dados da resposta (ex: { message: 'Login bem-sucedido!', user: '...' })
    } catch (error) {
        console.error('Erro ao fazer login AD:', error);
        throw error;
    }
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(JWT_TOKEN_KEY); // Remove o JWT
    }
};

export const getToken = (): string | null => {
    return typeof window !== 'undefined' ? localStorage.getItem(JWT_TOKEN_KEY) : null;
};

export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    // Basicamente, se há um token, consideramos autenticado.
    // Em produção, você também validaria a expiração do token.
    return !!token;
};