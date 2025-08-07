// app/links/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsefulLink } from '../data/links';
import LinkCard from '../components/LinkCard';
import SectionWrapper from '../components/SectionWrapper';
// Importa isAuthenticated E getToken. O warning (6133) sobre getToken não lido é esperado se não for usado.
import { isAuthenticated, getToken } from '../auth'; 
import { buildStrapiUrl } from '../config/api';

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
                // CORREÇÃO: Adicionar populate=icon para incluir os dados da imagem
                const response = await fetch(buildStrapiUrl('/api/links?populate=icon'));
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos de Links do Strapi (Links Page):", rawData);
                
                // ADICIONE ESTE LOG para ver cada item individualmente
                rawData.data?.forEach((item: any, index: number) => {
                    console.log(`Link ${index} (Links Page):`, item);
                    console.log(`Icon do Link ${index} (Links Page):`, item.icon);
                });

                // CORREÇÃO: Verificar se rawData.data é um array
                if (!Array.isArray(rawData.data)) {
                    console.error("rawData.data não é um array para links:", rawData.data);
                    setError("Formato de dados de links inesperado.");
                    setLoading(false);
                    return;
                }

                const transformedLinks: UsefulLink[] = rawData.data.map((item: any) => {
                    if (!item || typeof item.id === 'undefined') {
                        console.warn("Item de link inválido ou sem atributos:", item);
                        return null;
                    }

                    // CORREÇÃO: Log detalhado do processamento do ícone
                    console.log('Processando item (Links Page):', item);
                    console.log('Ícone original (Links Page):', item.icon);

                    // CORREÇÃO: Extrair URL do ícone corretamente baseado na estrutura do Strapi v5
                    let iconData = null;
                    
                    if (item.icon) {
                        if (item.icon.url) {
                            // Strapi v5 formato direto
                            iconData = buildStrapiUrl(item.icon.url);
                        } else if (item.icon.data && item.icon.data.attributes && item.icon.data.attributes.url) {
                            // Strapi v4 formato
                            iconData = buildStrapiUrl(item.icon.data.attributes.url);
                        } else {
                            // Se icon for um objeto complexo, vamos logar para debug
                            console.log('Estrutura do ícone não reconhecida (Links Page):', item.icon);
                        }
                    }

                    console.log('URL final do ícone (Links Page):', iconData);

                    return {
                        id: item.id,
                        title: item.title || 'Título Indisponível',
                        url: item.url || '#',
                        icon: iconData, // Usar iconData processado corretamente
                    };
                }).filter(Boolean); // Remove itens null

                console.log('Links transformados (Links Page):', transformedLinks);
                setLinks(transformedLinks);
            } catch (err) {
                if (err instanceof Error) { 
                    setError(err.message); 
                    console.error("Erro ao buscar links do Strapi:", err); 
                } else { 
                    setError("Ocorreu um erro desconhecido ao buscar links do Strapi."); 
                    console.error("Erro desconhecido ao buscar links do Strapi:", err); 
                }
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