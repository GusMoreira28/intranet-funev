// app/wiki/[slug]/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// CORRIGIDOS OS CAMINHOS: Agora são relativos à pasta 'app/wiki'
import { wikiArticlesData, WikiArticle } from '../../data/wikiArticles'; // Subir um nível (de [slug]) para 'wiki', depois outro para 'app', e então para 'data'
import SectionWrapper from '../../components/SectionWrapper'; // Subir um nível (de [slug]) para 'wiki', depois outro para 'app', e então para 'components'

// Define o tipo para os parâmetros da rota
interface WikiArticlePageProps {
    params: { slug: string };
}

export default function WikiArticlePage({ params }: WikiArticlePageProps) {
    const router = useRouter();
    const { slug } = params; // Captura o slug da URL

    const article: WikiArticle | undefined = wikiArticlesData.find(art => art.id === slug);

    if (!article) {
        return (
            <SectionWrapper title="Artigo Não Encontrado" titleColor="text-red-600">
                <p className="text-funevDark text-center">O artigo que você procura não foi encontrado.</p>
                <button
                    onClick={() => router.push('/wiki')}
                    className="mt-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md"
                >
                    &larr; Voltar para a Wiki
                </button>
            </SectionWrapper>
        );
    }

    return (
        <SectionWrapper title={article.title} titleColor="text-funevBlue">
            <button
                onClick={() => router.push('/wiki')}
                className="mb-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md"
            >
                &larr; Voltar para a Wiki
            </button>
            <p className="text-sm text-gray-600 italic mb-6">{article.date}</p>
            <p className="text-funevDark leading-relaxed whitespace-pre-wrap">{article.content}</p>
        </SectionWrapper>
    );
}