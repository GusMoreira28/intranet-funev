// app/components/BirthdayCard.tsx
import React from 'react';
import { Birthday } from '../data/birthdays';

interface BirthdayCardProps {
    person: Birthday;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({ person }) => {
    return (
        <div className="flex items-center space-x-4 bg-funevWhite p-3 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-funevBlue rounded-full flex items-center justify-center text-funevWhite font-bold text-xl">{person.photo}</div>
            <div>
                <p className="font-semibold text-funevDark">{person.name}</p>
                <p className="text-sm text-gray-600">{person.date}</p>
            </div>
        </div>
    );
};

export default BirthdayCard;
