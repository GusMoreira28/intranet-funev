// app/components/ArticleCard.tsx
import React from 'react';
import { WikiArticle } from '../data/wikiArticles';
import Link from 'next/link';

interface ArticleCardProps {
    article: WikiArticle;
    isSummary?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isSummary = false }) => {
    const articleHref = `/wiki/${article.id}`;

    return (
        // Ajustado rounded-md para rounded-lg e shadow-sm para shadow-md
        <div className="bg-funevLight p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg text-funevDark mb-2">{article.title}</h3>
            {isSummary ? (
                <p className="text-sm">{article.summary}</p>
            ) : (
                <p className="text-sm">{article.content.substring(0, 150)}...</p>
            )}
            <Link href={articleHref} passHref legacyBehavior>
                <a className="text-funevGreen hover:underline text-sm mt-2 block text-left">
                    {isSummary ? 'Ver detalhes' : 'Ler mais'}
                </a>
            </Link>
            <p className="text-sm text-gray-600 italic mt-2">{article.date}</p>
        </div>
    );
};

export default ArticleCard;
