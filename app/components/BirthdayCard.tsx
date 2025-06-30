// app/components/BirthdayCard.tsx
import React from 'react';
import { Birthday } from '../data/birthdays';

interface BirthdayCardProps {
    person: Birthday;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({ person }) => {
    return (
        <div className="flex items-center space-x-4 p-3 rounded-lg shadow-sm"
             style={{ backgroundColor: 'var(--color-funev-white)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
                 style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}>
                {person.photo}
            </div>
            <div>
                <p className="font-semibold" style={{ color: 'var(--color-funev-dark)' }}>{person.name}</p>
                <p className="text-sm" style={{ color: 'var(--color-funev-dark)' }}>{person.date}</p>
            </div>
        </div>
    );
};

export default BirthdayCard;