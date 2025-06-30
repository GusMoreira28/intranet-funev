// app/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    // Função auxiliar para gerenciar hover em links
    const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.color = 'var(--color-funev-green)';
        } else {
            e.currentTarget.style.color = 'var(--color-funev-white)';
        }
    };

    return (
        <header className="shadow-lg p-6 flex flex-col md:flex-row justify-between items-center"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}>
            <Link href="/" passHref legacyBehavior>
                <a className="text-3xl font-bold mb-4 md:mb-0 cursor-pointer transition duration-300"
                   style={{ color: 'var(--color-funev-white)' }}
                   onMouseEnter={(e) => handleLinkHover(e, true)}
                   onMouseLeave={(e) => handleLinkHover(e, false)}>
                    <img src="/logo-funev-branca.png" alt="Logo" className="h-18 inline-block mr-2" />
                </a>
            </Link>
            <nav className="space-x-4">
                <Link href="/wiki" passHref legacyBehavior>
                    <a className="transition duration-300"
                       style={{ color: 'var(--color-funev-white)' }}
                       onMouseEnter={(e) => handleLinkHover(e, true)}
                       onMouseLeave={(e) => handleLinkHover(e, false)}>
                        Wiki
                    </a>
                </Link>
                <Link href="/links" passHref legacyBehavior>
                    <a className="transition duration-300"
                       style={{ color: 'var(--color-funev-white)' }}
                       onMouseEnter={(e) => handleLinkHover(e, true)}
                       onMouseLeave={(e) => handleLinkHover(e, false)}>
                        Links Úteis
                    </a>
                </Link>
                <Link href="/birthdays" passHref legacyBehavior>
                    <a className="transition duration-300"
                       style={{ color: 'var(--color-funev-white)' }}
                       onMouseEnter={(e) => handleLinkHover(e, true)}
                       onMouseLeave={(e) => handleLinkHover(e, false)}>
                        Aniversariantes
                    </a>
                </Link>
                <Link href="/calendar" passHref legacyBehavior>
                    <a className="transition duration-300"
                       style={{ color: 'var(--color-funev-white)' }}
                       onMouseEnter={(e) => handleLinkHover(e, true)}
                       onMouseLeave={(e) => handleLinkHover(e, false)}>
                        Calendário de Eventos
                    </a>
                </Link>
            </nav>
        </header>
    );
};

export default Header;