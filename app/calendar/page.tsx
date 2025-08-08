// app/calendar/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '../data/events';
import EventCard from '../components/EventCard';
import SectionWrapper from '../components/SectionWrapper';
import { isAuthenticated, getToken } from '../auth'; // Importa funções de autenticação
import { buildStrapiUrl } from '../config/api';

export default function CalendarPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para o status de login


    const monthMap: Record<string, string> = {
        'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04', 'Maio': '05', 'Junho': '06',
        'Julho': '07', 'Agosto': '08', 'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
    };

    const getMonthNameFromDateString = (dateString: string): string => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
    };

    useEffect(() => {
        setIsLoggedIn(isAuthenticated()); // Verifica o status de login ao carregar
        // const token = getToken(); // Se você precisar do token para requisições autenticadas aqui
        // console.log('Token no CalendarPage:', token); // Exemplo de uso para remover o warning

        const fetchEvents = async () => {
            try {
                const response = await fetch(buildStrapiUrl('/events'));
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                const transformedEvents: Event[] = rawData.data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    date: item.date,
                    time: item.time,
                    location: item.location,
                    topic: item.topic,
                }));
                setEvents(transformedEvents);
            } catch (err) {
                if (err instanceof Error) { setError(err.message); console.error("Erro ao buscar eventos do Strapi:", err); } else { setError("Ocorreu um erro desconhecido ao buscar eventos do Strapi."); console.error("Erro desconhecido ao buscar eventos do Strapi:", err); }
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const groupedEvents = events.reduce((acc, event) => {
        const monthName = getMonthNameFromDateString(event.date);
        const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        if (!acc[capitalizedMonthName]) {
            acc[capitalizedMonthName] = [];
        }
        acc[capitalizedMonthName].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    const monthOrder = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Calendário Completo de Eventos" titleColor="var(--color-funev-blue)">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    &larr; Voltar para a Home
                </button>
                {isLoggedIn && ( // Botão "Adicionar Novo Evento" aparece apenas se logado
                    <button
                        onClick={() => router.push('/calendar/new')}
                        className="px-6 py-3 rounded-md shadow-md transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        + Adicionar Novo Evento
                    </button>
                )}
            </div>

            {loading && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando eventos...</p>
            )}
            {error && (
                <p className="text-center" style={{ color: 'red' }}>Erro ao carregar dados: {error}</p>
            )}
            {!loading && !error && Object.keys(groupedEvents).length === 0 && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum evento registrado ainda.</p>
            )}
            {!loading && !error && Object.keys(groupedEvents).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {monthOrder.map(month => (
                        groupedEvents[month] && groupedEvents[month].length > 0 && (
                            <div key={month} className="mb-8 p-4 rounded-lg shadow-sm"
                                 style={{ backgroundColor: 'var(--color-funev-light)' }}>
                                <h3 className="text-xl font-bold mb-4 pb-2 border-b-2"
                                    style={{ color: 'var(--color-funev-green)', borderColor: 'var(--color-funev-light)' }}>
                                    {month}
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {groupedEvents[month].map((event: Event, index: number) => (
                                        <EventCard key={index} event={event} />
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </SectionWrapper>
    );
}