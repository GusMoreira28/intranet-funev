// app/wiki/[slug]/WikiArticleContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WikiArticle } from '../../data/wikiArticles';
import SectionWrapper from '../../components/SectionWrapper';
// import DOMPurify from 'dompurify'; // Para sanitização em produção: npm install dompurify

interface WikiArticleContentProps {
    slug: string;
}

const WikiArticleContent: React.FC<WikiArticleContentProps> = ({ slug }) => {
    const router = useRouter();

    const [article, setArticle] = useState<WikiArticle | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError("Slug do artigo não fornecido.");
            setLoading(false);
            return;
        }

        const fetchArticle = async () => {
            try {
                const response = await fetch(`http://localhost:1337/api/wiki-articles?filters[documentId][$eq]=${slug}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setArticle(null);
                        return;
                    }
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos do Artigo da Wiki do Strapi (Single Page):", rawData);
                
                if (!rawData.data || rawData.data.length === 0) {
                    setArticle(null);
                    return;
                }

                const item = rawData.data[0];

                const transformedArticle: WikiArticle = {
                    id: item.id.toString(),
                    documentId: item.documentId || item.id.toString(),
                    title: item.title || 'Título Indisponível',
                    summary: item.summary || item.content?.substring(0, 150) + '...' || 'Resumo Indisponível',
                    content: item.content || '',
                    date: new Date(item.date || item.updatedAt || item.createdAt).toLocaleDateString('pt-BR'),
                };
                setArticle(transformedArticle);

            } catch (err) {
                if (err instanceof Error) { setError(err.message); console.error("Erro ao buscar artigo da Wiki:", err); } else { setError("Ocorreu um erro desconhecido ao buscar artigo da Wiki."); console.error("Erro desconhecido ao buscar artigo da Wiki.", err); }
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    if (loading) {
        return (
            <SectionWrapper title="Carregando Artigo..." titleColor="var(--color-funev-blue)">
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Aguarde...</p>
            </SectionWrapper>
        );
    }

    if (error) {
        return (
            <SectionWrapper title="Erro ao Carregar Artigo" titleColor="red">
                <p className="text-center" style={{ color: 'red' }}>{error}</p>
                <button
                    onClick={() => router.push('/wiki')}
                    className="mt-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    &larr; Voltar para a Wiki
                </button>
            </SectionWrapper>
        );
    }

    if (!article) {
        return (
            <SectionWrapper title="Artigo Não Encontrado" titleColor="var(--color-funev-dark)">
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>O artigo que você procura não foi encontrado.</p>
                <button
                    onClick={() => router.push('/wiki')}
                    className="mt-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-green)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    &larr; Voltar para a Wiki
                </button>
            </SectionWrapper>
        );
    }

    // Conteúdo HTML sanitizado (opcional, mas recomendado para produção)
    // const sanitizedContent = DOMPurify.sanitize(article.content);

    return (
        <SectionWrapper title={article.title} titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/wiki')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para a Wiki
            </button>
            <p className="text-sm italic mb-6" style={{ color: 'var(--color-funev-dark)' }}>{article.date}</p>
            {/* Renderiza o conteúdo HTML */}
            <div className="prose max-w-none" style={{ color: 'var(--color-funev-dark)' }}
                 dangerouslySetInnerHTML={{ __html: article.content }}></div>
            {/* Para produção, use: dangerouslySetInnerHTML={{ __html: sanitizedContent }}> */}
        </SectionWrapper>
    );
}

export default WikiArticleContent;