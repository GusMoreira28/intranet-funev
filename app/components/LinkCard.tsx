// app/components/LinkCard.tsx
import React, { useState } from 'react';
import { UsefulLink } from '../data/links';
import Link from 'next/link';

interface LinkCardProps {
    link: UsefulLink;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
    
    return (
        <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-4 rounded-lg  transition duration-300"
        >            
            <h3 className="font-bold text-2xl text-gray-500">{link.title}: </h3>
            <p className="text-2xl text-gray-500 ml-4">{link.url}</p>
        </a>
    );
};

export default LinkCard;