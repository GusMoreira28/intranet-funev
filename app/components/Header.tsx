// app/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '../auth';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, [pathname]);

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        router.push('/login');
    };

    // Função de hover para <a> tags
    const handleAnchorHover = (e: React.MouseEvent<HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.color = 'var(--color-funev-green)';
        } else {
            e.currentTarget.style.color = 'var(--color-funev-white)';
        }
    };

    return (
        <header className="w-full shadow-md" style={{ backgroundColor: 'var(--color-funev-blue)' }}>
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center cursor-pointer p-8"
                           onMouseEnter={(e) => handleAnchorHover(e, true)}
                           onMouseLeave={(e) => handleAnchorHover(e, false)}
                           style={{ backgroundColor: 'var(--color-funev-white)' }}>
                            <Image
                                src="/logo-funev.png"
                                alt="Logo FUNEV"
                                width={50}
                                height={50}
                                className="mx-6 h-16 w-auto"
                            />
                    </Link>
                </div>
                <nav className="pr-8">
                    <ul className="flex space-x-6 ">
                        <li>
                            <Link href="/" className={`text-2xl font-medium ${pathname === '/' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/wiki" className={`text-2xl font-medium ${pathname.startsWith('/wiki') ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Wiki
                            </Link>
                        </li>
                        <li>
                            <Link href="/comunicados" className={`text-2xl font-medium ${pathname === '/comunicados' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Comunicados
                            </Link>
                        </li>
                        <li>
                            <Link href="/links"  className={`text-2xl font-medium ${pathname === '/links' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Links

                            </Link>
                        </li>
                        <li>
                            <Link href="/birthdays"className={`text-2xl font-medium ${pathname === '/birthdays' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Aniversariantes

                            </Link>
                        </li>
                        <li>
                            <Link href="/calendar" className={`text-2xl font-medium ${pathname === '/calendar' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Eventos
                            </Link>
                        </li>
                        {isLoggedIn ? (
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="text-2xl font-medium underline"
                                    style={{ color: 'var(--color-funev-white)' }}
                                >
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <li>
                                <Link href="/login" className={`text-2xl font-medium ${pathname === '/login' ? 'underline' : ''}`}
                                      style={{ color: 'var(--color-funev-white)' }}>
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
