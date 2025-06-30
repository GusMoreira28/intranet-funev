// app/wiki/[slug]/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { wikiArticlesData, WikiArticle } from '../../data/wikiArticles';
import SectionWrapper from '../../components/SectionWrapper';

interface WikiArticlePageProps {
    params: { slug: string };
}

export default function WikiArticlePage({ params }: WikiArticlePageProps) {
    const router = useRouter();
    const { slug } = params;

    const article: WikiArticle | undefined = wikiArticlesData.find(art => art.id === slug);

    // Função auxiliar para gerenciar hover em botões
    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    if (!article) {
        return (
            <SectionWrapper title="Artigo Não Encontrado" titleColor="var(--color-funev-dark)"> {/* Usando funev-dark como fallback */}
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>O artigo que você procura não foi encontrado.</p>
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

    return (
        <SectionWrapper title={article.title} titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/wiki')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-green)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para a Wiki
            </button>
            <p className="text-sm italic mb-6" style={{ color: 'var(--color-funev-dark)' }}>{article.date}</p>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-funev-dark)' }}>{article.content}</p>
        </SectionWrapper>
    );
}