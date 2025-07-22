// app/links/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsefulLink } from '../data/links';
import LinkCard from '../components/LinkCard';
import SectionWrapper from '../components/SectionWrapper';
// Importa isAuthenticated E getToken. O warning (6133) sobre getToken não lido é esperado se não for usado.
import { isAuthenticated, getToken } from '../auth'; 

export default function LinksPage() {
    const router = useRouter();
    const [links, setLinks] = useState<UsefulLink[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated()); // Verifica o status de login ao carregar
        
        // Exemplo de como getToken PODE ser usado, o que removeria o warning.
        // const token = getToken();
        // if (token) {
        //     console.log('Token de autenticação:', token);
        // }

        const fetchLinks = async () => {
            try {
                const response = await fetch('http://localhost:1337/api/links');
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                const transformedLinks: UsefulLink[] = rawData.data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    url: item.url,
                }));
                setLinks(transformedLinks);
            } catch (err) {
                if (err instanceof Error) { setError(err.message); console.error("Erro ao buscar links do Strapi:", err); } else { setError("Ocorreu um erro desconhecido ao buscar links do Strapi."); console.error("Erro desconhecido ao buscar links do Strapi:", err); }
            } finally {
                setLoading(false);
            }
        };
        fetchLinks();
    }, []);

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Links Úteis Completos" titleColor="var(--color-funev-blue)">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    &larr; Voltar para a Home
                </button>
                {isLoggedIn && (
                    <button
                        onClick={() => router.push('/links/new')}
                        className="px-6 py-3 rounded-md shadow-md transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        + Adicionar Novo Link
                    </button>
                )}
            </div>
            {loading && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando links...</p>
            )}
            {error && (
                <p className="text-center" style={{ color: 'red' }}>Erro ao carregar links: {error}</p>
            )}
            {!loading && !error && links.length === 0 && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum link disponível.</p>
            )}
            {!loading && !error && links.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {links.map((link: UsefulLink, index: number) => (
                        <LinkCard key={index} link={link} />
                    ))}
                </div>
            )}
        </SectionWrapper>
    );
}