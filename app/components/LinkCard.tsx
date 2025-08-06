// app/components/LinkCard.tsx
import React from 'react';
import { UsefulLink } from '../data/links';
import Link from 'next/link';
import Image from 'next/image';

interface LinkCardProps {
    link: UsefulLink;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
    // CORREÇÃO: Simplificar a lógica de verificação da imagem
    let imageUrl: string | null = null;
    
    if (link.icon) {
        if (typeof link.icon === 'string') {
            // Se já for uma string (URL completa)
            imageUrl = link.icon;
        } else if (typeof link.icon === 'object' && link.icon.url) {
            // Se for um objeto com propriedade url
            imageUrl = link.icon.url.startsWith('http') 
                ? link.icon.url 
                : `http://localhost:1337${link.icon.url}`;
        }
    }

    // CORREÇÃO: console.log dentro da função
    console.log('Image URL in LinkCard:', imageUrl, 'Original icon:', link.icon);

    return (
        <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-funev-light)', color: 'var(--color-funev-dark)' }}
        >
            {imageUrl && (
                <div className="relative w-[24px] h-[24px] mr-2 flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={link.title || 'Ícone do Link'}
                        fill
                        style={{ objectFit: 'contain' }} // CORREÇÃO: objectFit como style
                        className="rounded-md"
                        onError={(e) => {
                            console.error('Erro ao carregar imagem:', imageUrl, e);
                        }}
                    />
                </div>
            )}
            
            {/* FALLBACK: Se não houver imagem, mostrar um placeholder */}
            {!imageUrl && (
                <div className="relative w-[24px] h-[24px] mr-2 flex-shrink-0">
                    <span className="text-gray-500 text-4xl">🔗</span>
                </div>
            )}
            
            <h3 className="font-bold text-lg">{link.title}</h3>
        </a>
    );
};

export default LinkCard;