// app/comunicados/[slug]/page.tsx
// ESTE É UM SERVER COMPONENT

import React from 'react';
import AnnouncementContent from './AnnouncementContent'; // Importa o Client Component filho

interface AnnouncementPageProps {
    params: { slug: string };
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug; // slug aqui é o documentId

    return (
        <AnnouncementContent slug={slug} />
    );
}