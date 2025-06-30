// app/components/SectionWrapper.tsx
import React from 'react';

interface SectionWrapperProps {
    id?: string;
    title: string;
    titleColor: string; // Isso é uma string que contém o valor da variável CSS (ex: 'var(--color-funev-blue)')
    description?: string;
    children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ id, title, titleColor, description, children }) => {
    return (
        <section id={id} className="p-8 rounded-lg shadow-lg mb-8"
                 style={{ backgroundColor: 'var(--color-funev-white)' }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: titleColor }}>{title}</h2>
            {description && <p className="mb-4" style={{ color: 'var(--color-funev-dark)' }}>{description}</p>}
            {children}
        </section>
    );
};

export default SectionWrapper;