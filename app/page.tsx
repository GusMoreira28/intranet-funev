// app/page.tsx
'use client'; // Componentes que usam hooks precisam ser Client Components

import { useState } from 'react';
import Link from 'next/link';

// CORRIGIDOS OS CAMINHOS: Agora são relativos à pasta 'app'
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

// Componentes de "páginas" completas, importados de app/components
import WikiPage from './wiki/page';
import LinksPage from './links/page';
import BirthdaysPage from './birthdays/page';
import CalendarPage from './calendar/page';
import WikiArticlePage from './wiki/[slug]/page';


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

    return (
        <>
            {/* Seção Wiki (resumida na home) */}
            <SectionWrapper id="wiki-home" title="Wiki Interna" titleColor="text-funevBlue" description="Bem-vindo à Wiki da FUNEV! Aqui você encontra informações importantes sobre processos, políticas e procedimentos internos.">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wikiArticlesData.slice(0,3).map((article: WikiArticle) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            isSummary={true}
                        />
                    ))}
                </div>
                <Link href="/wiki" passHref legacyBehavior>
                    <a className="mt-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md inline-block">
                        Acessar Wiki Completa
                    </a>
                </Link>
            </SectionWrapper>

            {/* Seção de Links Úteis (resumida na home) */}
            <SectionWrapper id="links-home" title="Links Úteis" titleColor="text-funevBlue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usefulLinks.slice(0, 4).map((link: UsefulLink, index: number) => (
                        <LinkCard key={index} link={link} />
                    ))}
                </div>
                <Link href="/links" passHref legacyBehavior>
                    <a className="mt-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md inline-block">
                        Ver todos os Links
                    </a>
                </Link>
            </SectionWrapper>

            {/* Seção de Aniversariantes */}
            <SectionWrapper id="birthdays" title="Aniversariantes do Mês" titleColor="text-funevBlue">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allBirthdays.slice(0, 4).map((person: Birthday, index: number) => (
                        <BirthdayCard key={index} person={person} />
                    ))}
                </div>
                <button className="mt-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md" onClick={() => openModal('birthdays')}>
                    Ver todos os Aniversariantes (via Modal)
                </button>
            </SectionWrapper>

            {/* Seção de Calendário de Eventos */}
            <SectionWrapper id="calendar" title="Calendário de Eventos" titleColor="text-funevBlue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allEvents.slice(0, 3).map((event: Event, index: number) => (
                        <EventCard key={index} event={event} />
                    ))}
                </div>
                <button className="mt-6 bg-funevGreen text-funevWhite px-6 py-3 rounded-md hover:bg-funevBlue transition duration-300 shadow-md" onClick={() => openModal('events')}>
                    Ver Calendário Completo (via Modal)
                </button>
            </SectionWrapper>

            {/* Modal - permanece na página que gerencia seu estado */}
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