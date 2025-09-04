// app/components/EventCard.tsx
import React, { useState } from 'react';
import { Event } from '../data/events';
import Image from 'next/image';
import { buildStrapiUrl } from '../config/api';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const [imageError, setImageError] = useState(false);

    let imageUrl: string | null = null;
    // Simplificar a lógica de verificação da imagem
    if (event.banner && !imageError) {
        if (typeof event.banner === 'string') {
            // Se já for uma string (URL completa)
            imageUrl = event.banner;
        } else if (typeof event.banner === 'object' && event.banner.url) {
            // Se for um objeto com propriedade url
            imageUrl = event.banner.url.startsWith('http')
                ? event.banner.url
                : buildStrapiUrl(event.banner.url); // Use o IP correto aqui
        }
    }
    return (
        <div className="flex p-4 rounded-lg">
            <div className="relative w-full h-80 mb-3 ">
                {imageUrl && !imageError && (
                    <Image
                        src={imageUrl || '/placeholder.png'} // Usa a URL completa construída ou um placeholder
                        alt={event.title || 'Imagem do Comunicado'}
                        layout="fill" // Preenche o espaço disponível
                        objectFit="contain" // Corta para cobrir
                        className="rounded-md w-full"
                    />
                )}
            </div>
            <div className='flex flex-col justify-center items-center pl-4'>
                <h3 className="text-2xl font-bold text-center" style={{ color: 'var(--color-funev-gray)' }}>{event.title}</h3>
                <div className='flex items-center gap-1'>
                    <p className="text-sm" style={{ color: 'var(--color-funev-gray)' }}>Data:</p>
                    <p className="text-sm" style={{ color: 'var(--color-funev-gray)' }}>{new Date(event.date).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
        </div>
    );
};

export default EventCard;