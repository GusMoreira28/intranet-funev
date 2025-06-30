// app/wiki/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// CORRIGIDOS OS CAMINHOS: Agora são relativos à pasta 'app'
import { wikiArticlesData, WikiArticle } from '../data/wikiArticles';
import ArticleCard from '../components/ArticleCard';
import SectionWrapper from '../components/SectionWrapper';

export default function WikiPage() {
    const router = useRouter();

    return (
        <SectionWrapper title="Wiki Completa da FUNEV" titleColor="text-funevBlue">
            <button
                onClick={() => router.push('/')} // Volta para a Home
                className="mb-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md"
            >
                &larr; Voltar para a Home
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wikiArticlesData.map((article: WikiArticle) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        isSummary={false} // Exibe o resumo no card da lista completa da Wiki
                    />
                ))}
            </div>
            <p className="text-center text-gray-700 mt-8">
                Para adicionar ou editar artigos, entre em contato com o administrador da intranet.
            </p>
        </SectionWrapper>
    );
}