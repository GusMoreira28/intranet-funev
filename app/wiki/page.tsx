// app/wiki/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { wikiArticlesData, WikiArticle } from '../data/wikiArticles';
import ArticleCard from '../components/ArticleCard';
import SectionWrapper from '../components/SectionWrapper';

export default function WikiPage() {
    const router = useRouter();

    // Função auxiliar para gerenciar hover em botões
    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Wiki Completa da FUNEV" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para a Home
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wikiArticlesData.map((article: WikiArticle) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        isSummary={false}
                    />
                ))}
            </div>
            <p className="text-center mt-8" style={{ color: 'var(--color-funev-dark)' }}>
                Para adicionar ou editar artigos, entre em contato com o administrador da intranet.
            </p>
        </SectionWrapper>
    );
}