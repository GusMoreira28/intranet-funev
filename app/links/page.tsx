// app/links/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usefulLinks, UsefulLink } from '../data/links';
import LinkCard from '../components/LinkCard';
import SectionWrapper from '../components/SectionWrapper';

export default function LinksPage() {
    const router = useRouter();

    // Função auxiliar para gerenciar hover em botões
    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Links Úteis Completos" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
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