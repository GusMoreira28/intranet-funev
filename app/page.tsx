// app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { allBirthdays, Birthday } from './data/birthdays';
import { allEvents, Event } from './data/events';
import { usefulLinks, UsefulLink } from './data/links';
import { wikiArticlesData, WikiArticle } from './data/wikiArticles';

import Modal from './components/Modal';
import SectionWrapper from './components/SectionWrapper';
import ArticleCard from './components/ArticleCard';
import LinkCard from './components/LinkCard';
import BirthdayCard from './components/BirthdayCard';
import EventCard from './components/EventCard';


export default function HomePage() {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<string>('');

    const openModal = (type: string) => {
        setModalType(type);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
    };

    // Função auxiliar para gerenciar hover em botões
    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <>
            <div className='grid grid-cols-2 sm:grid-cols-2 gap-8'>
                <SectionWrapper id="wiki-home" title="Wiki Interna" titleColor="var(--color-funev-blue)" description="Bem-vindo à Wiki da FUNEV! Aqui você encontra informações importantes sobre processos, políticas e procedimentos internos.">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wikiArticlesData.slice(0, 3).map((article: WikiArticle) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                isSummary={true}
                            />
                        ))}
                    </div>
                    <Link href="/wiki" passHref legacyBehavior>
                        <a className="mt-6 px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                            style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                            onMouseEnter={(e) => handleButtonHover(e, true)}
                            onMouseLeave={(e) => handleButtonHover(e, false)}>
                            Acessar Wiki Completa
                        </a>
                    </Link>
                </SectionWrapper>

                <SectionWrapper id="links-home" title="Links Úteis" titleColor="var(--color-funev-blue)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {usefulLinks.slice(0, 4).map((link: UsefulLink, index: number) => (
                            <LinkCard key={index} link={link} />
                        ))}
                    </div>
                    <Link href="/links" passHref legacyBehavior>
                        <a className="mt-6 px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                            style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                            onMouseEnter={(e) => handleButtonHover(e, true)}
                            onMouseLeave={(e) => handleButtonHover(e, false)}>
                            Ver todos os Links
                        </a>
                    </Link>
                </SectionWrapper>
            </div>
            <SectionWrapper id="birthdays" title="Aniversariantes do Mês" titleColor="var(--color-funev-blue)">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allBirthdays.slice(0, 4).map((person: Birthday, index: number) => (
                        <BirthdayCard key={index} person={person} />
                    ))}
                </div>
                <button className="mt-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    onClick={() => openModal('birthdays')}>
                    Ver todos os Aniversariantes (via Modal)
                </button>
            </SectionWrapper>

            <SectionWrapper id="calendar" title="Calendário de Eventos" titleColor="var(--color-funev-blue)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allEvents.slice(0, 3).map((event: Event, index: number) => (
                        <EventCard key={index} event={event} />
                    ))}
                </div>
                <button className="mt-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    onClick={() => openModal('events')}>
                    Ver Calendário Completo (via Modal)
                </button>
            </SectionWrapper>

            <Modal show={showModal} onClose={closeModal} title={modalType === 'birthdays' ? 'Todos os Aniversariantes' : 'Calendário Completo de Eventos'}>
                {modalType === 'birthdays' ? (
                    allBirthdays.map((person: Birthday, index: number) => (
                        <BirthdayCard key={index} person={person} />
                    ))
                ) : (
                    allEvents.map((event: Event, index: number) => (
                        <EventCard key={index} event={event} />
                    ))
                )}
            </Modal>
        </>
    );
}