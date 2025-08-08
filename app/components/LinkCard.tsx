// app/components/LinkCard.tsx
import React, { useState } from 'react';
import { UsefulLink } from '../data/links';
import Link from 'next/link';
import Image from 'next/image';
import { buildStrapiUrl } from '../config/api';

interface LinkCardProps {
    link: UsefulLink;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
    const [imageError, setImageError] = useState(false);
    
    // Simplificar a lógica de verificação da imagem
    let imageUrl: string | null = null;
    
    if (link.icon && !imageError) {
        if (typeof link.icon === 'string') {
            // Se já for uma string (URL completa)
            imageUrl = link.icon;
        } else if (typeof link.icon === 'object' && link.icon.url) {
            // Se for um objeto com propriedade url
            imageUrl = link.icon.url.startsWith('http') 
                ? link.icon.url 
                : buildStrapiUrl(link.icon.url); // Use o IP correto aqui
        }
    }

    console.log('Image URL in LinkCard:', imageUrl, 'Original icon:', link.icon);

    const handleImageError = () => {
        console.error('Erro ao carregar imagem:', imageUrl);
        setImageError(true);
    };

    return (
        <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-funev-light)', color: 'var(--color-funev-dark)' }}
        >
            {imageUrl && !imageError ? (
                <div className="relative w-[24px] h-[24px] mr-2 flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={link.title || 'Ícone do Link'}
                        width={24}
                        height={24}
                        style={{ objectFit: 'contain' }}
                        className="rounded-md"
                        onError={handleImageError}
                    />
                </div>
            ) : (
                <div className="relative w-[24px] h-[24px] mr-2 flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">🔗</span>
                </div>
            )}
            
            <h3 className="font-bold text-lg">{link.title}</h3>
        </a>
    );
};

export default LinkCard;