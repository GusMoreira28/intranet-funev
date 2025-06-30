// app/birthdays/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { allBirthdays, Birthday } from '../data/birthdays';
import BirthdayCard from '../components/BirthdayCard';
import SectionWrapper from '../components/SectionWrapper';

export default function BirthdaysPage() {
    const router = useRouter();

    const groupedBirthdays = allBirthdays.reduce((acc, person) => {
        const month = person.month;
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(person);
        return acc;
    }, {} as Record<string, Birthday[]>);

    const monthOrder = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Função auxiliar para gerenciar hover em botões
    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Aniversariantes - Todos os Meses" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para a Home
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {monthOrder.map(month => (
                    groupedBirthdays[month] && groupedBirthdays[month].length > 0 && (
                        <div key={month} className="mb-8 p-4 rounded-lg shadow-sm"
                             style={{ backgroundColor: 'var(--color-funev-light)' }}>
                            <h3 className="text-xl font-bold mb-4 pb-2 border-b-2"
                                style={{ color: 'var(--color-funev-green)', borderColor: 'var(--color-funev-light)' }}>
                                {month}
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {groupedBirthdays[month].map((person: Birthday, index: number) => (
                                    <BirthdayCard key={index} person={person} />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum aniversariante registrado ainda.</p>
        </SectionWrapper>
    );
}