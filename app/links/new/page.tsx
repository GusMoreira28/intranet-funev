// app/links/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SectionWrapper from '../../components/SectionWrapper';
import { isAuthenticated, getToken } from '../../auth'; // Importa funções de autenticação

export default function NewLinkPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Redireciona se não estiver logado
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = getToken(); // Obtém o token JWT do localStorage
        if (!token) {
            setError('Sessão expirada ou credenciais ausentes. Por favor, faça login novamente.');
            setLoading(false);
            router.push('/login'); // Redireciona para login se não houver token
            return;
        }

        try {
            const response = await fetch('http://localhost:1337/api/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // <<< CRÍTICO: Inclui o token JWT no cabeçalho
                },
                body: JSON.stringify({
                    data: { // Strapi espera os dados dentro de um objeto 'data'
                        title,
                        description,
                        url,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Mensagens de erro mais específicas do Strapi
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Credenciais inválidas ou permissão negada. Verifique seu login e permissões no Strapi.');
                }
                throw new Error(errorData.error?.message || `Falha ao adicionar link: ${response.statusText}`);
            }

            setSuccess('Link adicionado com sucesso!');
            setTitle('');
            setDescription('');
            setUrl('');
            router.push('/links'); // Redireciona para a lista de links após o sucesso

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido ao adicionar o link.');
            }
            console.error('Erro na submissão do link:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Adicionar Novo Link Útil" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/links')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para Links
            </button>

            <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md"
                 style={{ backgroundColor: 'var(--color-funev-light)', border: '1px solid var(--color-funev-green)' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Título:
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Descrição:
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            URL:
                        </label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        {loading ? 'Adicionando...' : 'Adicionar Link'}
                    </button>
                </form>
            </div>
        </SectionWrapper>
    );
}