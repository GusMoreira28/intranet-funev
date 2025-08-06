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
        <header className="w-full py-4 shadow-md" style={{ backgroundColor: 'var(--color-funev-blue)' }}>
            <div className="container mx-auto flex justify-between items-center px-4">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center cursor-pointer"
                           onMouseEnter={(e) => handleAnchorHover(e, true)}
                           onMouseLeave={(e) => handleAnchorHover(e, false)}>
                            <Image
                                src="/logo-funev-branca.png"
                                alt="Logo FUNEV"
                                width={50}
                                height={50}
                                className="mr-3 ml-6"
                            />
                    </Link>
                </div>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className={`text-lg font-medium ${pathname === '/' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/wiki" className={`text-lg font-medium ${pathname.startsWith('/wiki') ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Wiki
                            </Link>
                        </li>
                        <li>
                            <Link href="/comunicados" className={`text-lg font-medium ${pathname === '/comunicados' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Comunicados
                            </Link>
                        </li>
                        <li>
                            <Link href="/links"  className={`text-lg font-medium ${pathname === '/links' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Links

                            </Link>
                        </li>
                        <li>
                            <Link href="/birthdays"className={`text-lg font-medium ${pathname === '/birthdays' ? 'underline' : ''}`}
                                   style={{ color: 'var(--color-funev-white)' }}
                                   onMouseEnter={(e) => handleAnchorHover(e, true)}
                                   onMouseLeave={(e) => handleAnchorHover(e, false)}>
                                    Aniversariantes

                            </Link>
                        </li>
                        <li>
                            <Link href="/calendar" className={`text-lg font-medium ${pathname === '/calendar' ? 'underline' : ''}`}
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
                                    className="text-lg font-medium underline"
                                    style={{ color: 'var(--color-funev-dark)', background: 'var(--color-funev-white)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '4px' }}
                                >
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <li>
                                <Link href="/login" className={`text-lg font-medium ${pathname === '/login' ? 'underline' : ''}`}
                                      style={{ color: 'var(--color-funev-dark)', background: 'var(--color-funev-white)', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '4px' }}>
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
