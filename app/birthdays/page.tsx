// app/birthdays/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// CORRIGIDOS OS CAMINHOS: Agora são relativos à pasta 'app'
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

    return (
        <SectionWrapper title="Aniversariantes - Todos os Meses" titleColor="text-funevBlue">
            <button
                onClick={() => router.push('/')} // Volta para a Home
                className="mb-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md"
            >
                &larr; Voltar para a Home
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {monthOrder.map(month => (
                    groupedBirthdays[month] && groupedBirthdays[month].length > 0 && (
                        <div key={month} className="mb-8 p-4 rounded-lg bg-funevLight shadow-sm">
                            <h3 className="text-xl font-bold text-funevGreen mb-4 border-b-2 border-funevLight pb-2">
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

            {!Object.keys(groupedBirthdays).length && (
                <p className="text-center text-gray-700">Nenhum aniversariante registrado ainda.</p>
            )}
        </SectionWrapper>
    );
}