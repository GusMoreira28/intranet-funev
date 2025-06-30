// app/components/SectionWrapper.tsx
import React from 'react';

interface SectionWrapperProps {
    id?: string;
    title: string;
    titleColor: string;
    description?: string;
    children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ id, title, titleColor, description, children }) => {
    return (

        <section id={id} className="bg-funevWhite p-8 rounded-lg shadow-lg mb-8">
            <h2 className={`text-2xl font-semibold ${titleColor} mb-4`}>{title}</h2>
            {description && <p className="text-funevDark mb-4">{description}</p>}
            {children}
        </section>
    );
};

export default SectionWrapper;
