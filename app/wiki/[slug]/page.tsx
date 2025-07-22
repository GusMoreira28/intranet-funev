// app/wiki/[slug]/page.tsx
// ESTE É UM SERVER COMPONENT

import React from 'react';
import WikiArticleContent from './WikiArticleContent';

interface WikiArticlePageProps {
    // CORREÇÃO: Tipar 'params' como Promise<any> para satisfazer o Next.js
    // Ou, mais especificamente: params: Promise<{ slug: string }>;
    params: Promise<any>; // Next.js espera que params seja uma Promise em Server Components async
}

// Este componente é um Server Component por padrão
export default async function WikiArticlePage({ params }: WikiArticlePageProps) {
    // Agora, 'params' é uma Promise, então precisamos aguardá-la.
    const resolvedParams = await params; 
    const slug = resolvedParams.slug; // Acessa o slug da variável resolvida

    return (
        // Renderiza o Client Component filho e passa o slug como prop
        <WikiArticleContent slug={slug} />
    );
}