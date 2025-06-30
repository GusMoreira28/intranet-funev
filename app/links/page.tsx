// app/links/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// CORRIGIDOS OS CAMINHOS: Agora são relativos à pasta 'app'
import { usefulLinks, UsefulLink } from '../data/links';
import LinkCard from '../components/LinkCard';
import SectionWrapper from '../components/SectionWrapper';

export default function LinksPage() {
    const router = useRouter();

    return (
        <SectionWrapper title="Links Úteis Completos" titleColor="text-funevBlue">
            <button
                onClick={() => router.push('/')} // Volta para a Home
                className="mb-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md"
            >
                &larr; Voltar para a Home
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usefulLinks.map((link: UsefulLink, index: number) => (
                    <LinkCard key={index} link={link} />
                ))}
            </div>
        </SectionWrapper>
    );
}