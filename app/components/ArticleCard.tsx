// app/components/ArticleCard.tsx
'use client';

import React from 'react';
import { WikiArticle } from '../data/wikiArticles';
import Link from 'next/link';

interface ArticleCardProps {
    article: WikiArticle;
    isSummary?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isSummary = false }) => {
    const articleHref = `/wiki/${article.id}`;

    // Função auxiliar para gerenciar hover em links
    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.color = 'var(--color-funev-green)';
        } else {
            e.currentTarget.style.color = 'var(--color-funev-dark)'; // Cor padrão do link
        }
    };

    return (
        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-funev-light)' }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-funev-dark)' }}>{article.title}</h3>
            {isSummary ? (
                <p className="text-sm" style={{ color: 'var(--color-funev-dark)' }}>{article.summary}</p>
            ) : (
                <p className="text-sm" style={{ color: 'var(--color-funev-dark)' }}>{article.content.substring(0, 150)}...</p>
            )}
            <Link href={articleHref} passHref legacyBehavior>
                <a className="hover:underline text-sm mt-2 block text-left transition duration-300"
                   style={{ color: 'var(--color-funev-dark)' }}
                   onMouseEnter={(e) => handleLinkHover(e, true)}
                   onMouseLeave={(e) => handleLinkHover(e, false)}>
                    {isSummary ? 'Ver detalhes' : 'Ler mais'}
                </a>
            </Link>
            <p className="text-sm italic mt-2" style={{ color: 'var(--color-funev-dark)' }}>{article.date}</p>
        </div>
    );
};

export default ArticleCard;