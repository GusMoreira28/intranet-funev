// app/components/LinkCard.tsx
import React from 'react';
import { UsefulLink } from '../data/links';

interface LinkCardProps {
    link: UsefulLink;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
    return (
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="block bg-funevLight p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <h3 className="font-bold text-lg text-funevDark">{link.title}</h3>
            <p className="text-sm text-gray-600">{link.description}</p>
        </a>
    );
};

export default LinkCard;
