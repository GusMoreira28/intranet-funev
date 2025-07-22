// app/wiki/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WikiArticle } from '../data/wikiArticles';
import ArticleCard from '../components/ArticleCard';
import SectionWrapper from '../components/SectionWrapper';
import { isAuthenticated, getToken } from '../auth';

export default function WikiPage() {
    const router = useRouter();
    const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        const fetchWikiArticles = async () => {
            try {
                const response = await fetch('http://localhost:1337/api/wiki-articles'); // Endpoint do Strapi para Wiki
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos da Wiki do Strapi (WikiPage):", rawData); // DEBUG: Verifique esta saída!

                // Verifica se rawData.data é um array antes de mapear
                if (!Array.isArray(rawData.data)) {
                    console.error("rawData.data não é um array para artigos da Wiki:", rawData.data);
                    setError("Formato de dados da Wiki inesperado.");
                    setLoading(false);
                    return;
                }
                if (rawData.data.length === 0) {
                    console.warn("Nenhum artigo da Wiki retornado pelo Strapi (WikiPage).");
                }


                const transformedArticles: WikiArticle[] = rawData.data.map((item: any) => {
                    // Verificação de segurança: garantir que item e item.attributes existam
                    if (!item || typeof item.id === 'undefined') { // Removido !item.attributes
                        console.warn("Item de artigo da Wiki inválido ou sem atributos:", item);
                        return null;
                    }
                    // Mapeamento direto dos campos, sem .attributes
                    return {
                        id: item.id.toString(), // ID numérico
                        documentId: item.documentId || item.id.toString(), // <<< Mapeia documentId
                        title: item.title || 'Título Indisponível', // Fallback
                        summary: item.summary || item.content?.substring(0, 150) + '...' || 'Resumo Indisponível', // Fallback
                        content: item.content || '',
                        date: new Date(item.updatedAt || item.createdAt).toLocaleDateString('pt-BR'),
                    };
                }).filter(Boolean); // Filtra quaisquer itens nulos

                setWikiArticles(transformedArticles);
            } catch (err) {
                if (err instanceof Error) { setError(err.message); console.error("Erro ao buscar artigos da Wiki do Strapi:", err); } else { setError("Ocorreu um erro desconhecido ao buscar artigos da Wiki do Strapi."); console.error("Erro desconhecido ao buscar artigos da Wiki do Strapi:", err); }
            } finally {
                setLoading(false);
            }
        };
        fetchWikiArticles();
    }, []);

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Wiki Completa da FUNEV" titleColor="var(--color-funev-blue)">
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
                    <Link href="/wiki/new" className="px-6 py-3 rounded-md shadow-md transition duration-300"
                           style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                           onMouseEnter={(e) => handleButtonHover(e, true)}
                           onMouseLeave={(e) => handleButtonHover(e, false)}>
                            + Adicionar Novo Artigo
                    </Link>
                )}
            </div>
            {loading && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando artigos da Wiki...</p>
            )}
            {error && (
                <p className="text-center" style={{ color: 'red' }}>Erro ao carregar Wiki: {error}</p>
            )}
            {!loading && !error && wikiArticles.length === 0 && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum artigo da Wiki disponível.</p>
            )}
            {!loading && !error && wikiArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wikiArticles.map((article: WikiArticle) => (
                        <ArticleCard
                            key={article.documentId} // Usa o documentId para a key
                            article={article}
                            isSummary={false}
                        />
                    ))}
                </div>
            )}
            <p className="text-center mt-8" style={{ color: 'var(--color-funev-dark)' }}>
                Para adicionar ou editar artigos, entre em contato com o administrador da intranet.
            </p>
        </SectionWrapper>
    );
}