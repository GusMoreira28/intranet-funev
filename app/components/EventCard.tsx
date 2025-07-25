// app/components/EventCard.tsx
import React from 'react';
import { Event } from '../data/events';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    return (
        <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-funev-light)' }}>
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-funev-dark)' }}>{event.title}</h3>
            <p className="text-sm" style={{ color: 'var(--color-funev-dark)' }}>Data: {new Date(event.date).toLocaleDateString('pt-BR')}</p>
            <p className="text-sm" style={{ color: 'var(--color-funev-dark)' }}>Horário: {event.time}</p>
            <p className="text-sm" style={{ color: 'var(--color-funev-dark)' }}>Local: {event.location}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-funev-green)' }}>Tema: {event.topic}</p>
        </div>
    );
};

export default EventCard;