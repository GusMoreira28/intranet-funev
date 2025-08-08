import React from 'react';
import AnnouncementContent from './AnnouncementContent';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <AnnouncementContent slug={slug} />;
}