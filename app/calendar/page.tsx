// app/calendar/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { allEvents, Event } from '../data/events';
import EventCard from '../components/EventCard';
import SectionWrapper from '../components/SectionWrapper';

export default function CalendarPage() {
    const router = useRouter();

    const monthMap: Record<string, string> = {
        'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04', 'Maio': '05', 'Junho': '06',
        'Julho': '07', 'Agosto': '08', 'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
    };

    const groupedEvents = allEvents.reduce((acc, event) => {
        const match = event.date.match(/(\d{2}) de (\w+) de (\d{4})/);
        if (match) {
            const day = match[1];
            const monthWord = match[2];
            const year = match[3];

            const monthNum = monthMap[monthWord];
            if (!monthNum) {
                console.warn(`Mês não encontrado no mapeamento para o evento: ${event.date}`);
                return acc;
            }

            const standardDateString = `${year}-${monthNum}-${day}`;
            const eventDate = new Date(standardDateString);

            if (isNaN(eventDate.getTime())) {
                console.error("Data de evento inválida após parse:", event.date, standardDateString);
                return acc;
            }

            const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(eventDate);
            const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

            if (!acc[capitalizedMonthName]) {
                acc[capitalizedMonthName] = [];
            }
            acc[capitalizedMonthName].push(event);
        } else {
            console.warn(`Formato de data inesperado para o evento: ${event.date}`);
        }
        return acc;
    }, {} as Record<string, Event[]>);

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
        <SectionWrapper title="Calendário Completo de Eventos" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para a Home
            </button>

            {monthOrder.map(month => (
                groupedEvents[month] && groupedEvents[month].length > 0 && (
                    <div key={month} className="mb-8 p-4 rounded-lg shadow-sm"
                         style={{ backgroundColor: 'var(--color-funev-light)' }}>
                        <h3 className="text-xl font-bold mb-4 pb-2 border-b-2"
                            style={{ color: 'var(--color-funev-green)', borderColor: 'var(--color-funev-light)' }}>
                            {month}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groupedEvents[month].map((event: Event, index: number) => (
                                <EventCard key={index} event={event} />
                            ))}
                        </div>
                    </div>
                )
            ))}

            <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum evento registrado ainda.</p>
        </SectionWrapper>
    );
}