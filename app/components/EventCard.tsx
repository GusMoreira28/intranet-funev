// app/components/EventCard.tsx
import React from 'react';
import { Event } from '../data/events';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    return (
        <div className="bg-funevLight p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg text-funevDark">{event.title}</h3>
            <p className="text-sm text-gray-600">Data: {event.date}</p>
            <p className="text-sm text-gray-600">Horário: {event.time}</p>
            <p className="text-sm text-gray-600">Local: {event.location}</p>
            <p className="text-sm text-funevGreen mt-2">Tema: {event.topic}</p>
        </div>
    );
};

export default EventCard;
