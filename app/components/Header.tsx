'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="bg-funevBlue shadow-lg p-6 text-funevWhite flex flex-col md:flex-row justify-between items-center rounded-b-lg">
            <Link href="/" passHref legacyBehavior>
                <a className="text-3xl font-bold mb-4 md:mb-0 cursor-pointer hover:text-funevGreen transition duration-300">
                    Intranet FUNEV
                </a>
            </Link>
            <nav className="space-x-4">
                <Link href="/wiki" passHref legacyBehavior>
                    <a className="hover:text-funevGreen transition duration-300">Wiki</a>
                </Link>
                <Link href="/links" passHref legacyBehavior>
                    <a className="hover:text-funevGreen transition duration-300">Links Úteis</a>
                </Link>
                <Link href="/birthdays" passHref legacyBehavior>
                    <a className="hover:text-funevGreen transition duration-300">Aniversariantes</a>
                </Link>
                <Link href="/calendar" passHref legacyBehavior>
                    <a className="hover:text-funevGreen transition duration-300">Calendário de Eventos</a>
                </Link>
            </nav>
        </header>
    );
};

export default Header;