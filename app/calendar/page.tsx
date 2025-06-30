// app/calendar/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// CORRIGIDOS OS CAMINHOS: Agora são relativos à pasta 'app'
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

    return (
        <SectionWrapper title="Calendário Completo de Eventos" titleColor="text-funevBlue">
            <button
                onClick={() => router.push('/')} // Volta para a Home
                className="mb-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md"
            >
                &larr; Voltar para a Home
            </button>

            {monthOrder.map(month => (
                groupedEvents[month] && groupedEvents[month].length > 0 && (
                    <div key={month} className="mb-8 p-4 rounded-lg bg-funevLight shadow-sm">
                        <h3 className="text-xl font-bold text-funevGreen mb-4 border-b-2 border-funevLight pb-2">
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

            {!Object.keys(groupedEvents).length && (
                <p className="text-center text-gray-700">Nenhum evento registrado ainda.</p>
            )}
        </SectionWrapper>
    );
}