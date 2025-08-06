// app/components/AnnouncementCard.tsx
'use client';

import React from 'react';
import { Announcement } from '../data/announcements';
import Link from 'next/link';
import Image from 'next/image';

interface AnnouncementCardProps {
    announcement: Announcement;
    isSummary?: boolean; // Se for um card de resumo (Home)
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, isSummary = false }) => {
    const announcementHref = `/comunicados/${announcement.documentId}`;

    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.color = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.color = 'var(--color-funev-blue)';
        }
    };

    // CONSTRUÇÃO DA URL DA IMAGEM: A URL completa deve ser gerada
    const imageUrl = announcement.content && announcement.content.url 
                     ? `http://localhost:1337${announcement.content.url}` 
                     : null;

    return (
        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-funev-light)' }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-funev-dark)' }}>{announcement.title}</h3>
            
            {imageUrl && (
                <div className="relative w-full h-80 mb-3 rounded-md overflow-hidden">
                    <Image
                        src={imageUrl} // Usa a URL completa construída
                        alt={announcement.title || 'Imagem do Comunicado'}
                        layout="fill" // Preenche o espaço disponível
                        objectFit="contain" // Corta para cobrir
                        className="rounded-md"
                    />
                </div>
            )}

            <Link href={announcementHref} className="hover:underline text-sm mt-2 block text-left transition duration-300"
                   style={{ color: 'var(--color-funev-dark)' }}
                   onMouseEnter={(e) => handleLinkHover(e, true)}
                   onMouseLeave={(e) => handleLinkHover(e, false)}>
                    Ler mais
            </Link>
            <p className="text-sm italic mt-2" style={{ color: 'var(--color-funev-dark)' }}>
                Por {announcement.author} em {announcement.date}
            </p>
        </div>
    );
};

export default AnnouncementCard;
