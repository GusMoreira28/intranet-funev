// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Event } from './data/events';
import { UsefulLink } from './data/links';
import { WikiArticle } from './data/wikiArticles'; // Importa WikiArticle
import { Birthday, RawApiBirthday } from './data/birthdays';
import { Announcement } from './data/announcements';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getToken } from './auth';

// Import da configuração de API
import { buildFastApiUrl, buildStrapiUrl, API_CONFIG } from './config/api';

import SectionWrapper from './components/SectionWrapper';
import ArticleCard from './components/ArticleCard';
import LinkCard from './components/LinkCard';
import BirthdayCard from './components/BirthdayCard';
import EventCard from './components/EventCard';
import AnnouncementCard from './components/AnnouncementCard';
import Modal from './components/Modal';


export default function HomePage() {
    const router = useRouter();

    const [currentMonthBirthdays, setCurrentMonthBirthdays] = useState<Birthday[]>([]);
    const [loadingBirthdays, setLoadingBirthdays] = useState<boolean>(true);
    const [errorBirthdays, setErrorBirthdays] = useState<string | null>(null);

    const [currentMonthEvents, setCurrentMonthEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
    const [errorEvents, setErrorEvents] = useState<string | null>(null);

    const [homeWikiArticles, setHomeWikiArticles] = useState<WikiArticle[]>([]);
    const [loadingWiki, setLoadingWiki] = useState<boolean>(true);
    const [errorWiki, setErrorWiki] = useState<string | null>(null);

    const [homeLinks, setHomeLinks] = useState<UsefulLink[]>([]);
    const [loadingLinks, setLoadingLinks] = useState<boolean>(true);
    const [errorLinks, setErrorLinks] = useState<string | null>(null);

    const [homeAnnouncements, setHomeAnnouncements] = useState<Announcement[]>([]);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(true);
    const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);


    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<string>('');
    const [showTiModal, setShowTiModal] = useState<boolean>(false);
    const [showTodayBirthdayModal, setShowTodayBirthdayModal] = useState<boolean>(false);

    const [todayBirthdays, setTodayBirthdays] = useState<Birthday[]>([]);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    const getInitials = (fullName: string): string => {
        const names = fullName.split(' ').filter(n => n.length > 0);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const getMonthName = (dateString: string): string => {
        const parts = dateString.split('/');
        if (parts.length !== 3) return '';
        const monthNum = parseInt(parts[1], 10);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return '';
        const date = new Date(2000, monthNum - 1, 1);
        return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
    };

    // Efeito para buscar aniversariantes do mês e dia atual (API Python)
    useEffect(() => {
        const fetchBirthdaysData = async () => {
            try {
                const response = await fetch(buildFastApiUrl('/colaborador'));
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData: RawApiBirthday[] = await response.json();
                const transformedData: Birthday[] = rawData.map(item => {
                    const day = item.data.substring(0, 2);
                    const monthName = getMonthName(item.data);
                    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    return {
                        name: item.nome,
                        date: `${day} de ${capitalizedMonthName}`,
                        photo: getInitials(item.nome),
                        month: capitalizedMonthName,
                        role: item.cargo || '', // Adiciona a propriedade 'role' (ajuste conforme necessário)
                    };
                });

                const today = new Date();
                const currentDay = today.getDate();
                const currentMonth = today.toLocaleString('pt-BR', { month: 'long' });
                const capitalizedCurrentMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

                // Filtra aniversariantes do mês atual
                const filteredMonthBirthdays = transformedData.filter(
                    (person) => person.month === capitalizedCurrentMonth
                );
                setCurrentMonthBirthdays(filteredMonthBirthdays);

                // Filtra aniversariantes do dia atual
                const filteredTodayBirthdays = transformedData.filter(
                    (person) => {
                        const personDay = parseInt(person.date.split(' ')[0], 10);
                        return personDay === currentDay && person.month === capitalizedCurrentMonth;
                    }
                );
                setTodayBirthdays(filteredTodayBirthdays); // NOVO: Define os aniversariantes do dia

                // Verificar se é o primeiro acesso do dia
                const today_string = today.toDateString(); // Ex: "Wed Aug 06 2025"
                const lastModalShown = localStorage.getItem('birthdayModalLastShown');

                if (lastModalShown !== today_string) {
                    // É o primeiro acesso do dia, mostrar modal
                    setShowTodayBirthdayModal(true);
                    // Salvar a data atual
                    localStorage.setItem('birthdayModalLastShown', today_string);
                }
            } catch (err) {
                if (err instanceof Error) { setErrorBirthdays(err.message); console.error("Erro ao buscar aniversariantes:", err); } else { setErrorBirthdays("Ocorreu um erro desconhecido."); console.error("Erro desconhecido ao buscar aniversariantes:", err); }
            } finally {
                setLoadingBirthdays(false);
            }
        };
        fetchBirthdaysData();
    }, []);

    // Efeito para buscar eventos do mês atual do Strapi
    useEffect(() => {
        const fetchCurrentMonthEvents = async () => {
            try {
                const response = await fetch(buildStrapiUrl('/events')); // Endpoint do Strapi para eventos
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos de Eventos do Strapi (Home):", rawData); // DEBUG: Verifique esta saída!

                const transformedEvents: Event[] = rawData.data.map((item: any) => {
                    if (!item || typeof item.id === 'undefined') {
                        console.warn("Item de evento inválido ou sem atributos:", item);
                        return null;
                    }
                    return {
                        id: item.id,
                        title: item.title || 'Título Indisponível',
                        date: item.date || '',
                        time: item.time || '',
                        location: item.location || '',
                        topic: item.topic || '',
                    };
                }).filter(Boolean); // Filtra quaisquer itens nulos

                const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
                const capitalizedCurrentMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

                const filteredEvents = transformedEvents.filter(event => {
                    const eventDate = new Date(event.date); // Certifique-se de que a data do Strapi é parsável
                    const eventMonth = eventDate.toLocaleString('pt-BR', { month: 'long' });
                    const capitalizedEventMonth = eventMonth.charAt(0).toUpperCase() + eventMonth.slice(1);
                    return capitalizedEventMonth === capitalizedCurrentMonth;
                });
                setCurrentMonthEvents(filteredEvents);
            } catch (err) {
                if (err instanceof Error) { setErrorEvents(err.message); console.error("Erro ao buscar eventos do mês do Strapi:", err); } else { setErrorEvents("Ocorreu um erro desconhecido ao buscar eventos do Strapi."); console.error("Erro desconhecido ao buscar eventos do Strapi:", err); }
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchCurrentMonthEvents();
    }, []);

    // Efeito para buscar artigos da Wiki na Home do Strapi
    useEffect(() => {
        const fetchWikiArticles = async () => {
            try {
                const response = await fetch(buildStrapiUrl('/wiki-articles')); // Endpoint do Strapi para Wiki
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos da Wiki do Strapi (Home):", rawData); // DEBUG: Verifique esta saída!

                // Verifica se rawData.data é um array antes de mapear
                if (!Array.isArray(rawData.data)) {
                    console.error("rawData.data não é um array para artigos da Wiki:", rawData.data);
                    setErrorWiki("Formato de dados da Wiki inesperado.");
                    setLoadingWiki(false);
                    return;
                }
                if (rawData.data.length === 0) {
                    console.warn("Nenhum artigo da Wiki retornado pelo Strapi (Home).");
                }


                const transformedArticles: WikiArticle[] = rawData.data.map((item: any) => {
                    // Verificação de segurança: garantir que item e item.attributes existem
                    if (!item || typeof item.id === 'undefined') { // Removido !item.attributes
                        console.warn("Item de artigo da Wiki inválido ou sem atributos:", item);
                        return null;
                    }
                    // Mapeamento direto dos campos, sem .attributes
                    return {
                        id: item.id.toString(),
                        documentId: item.documentId || item.id.toString(), // <<< Mapeia documentId
                        title: item.title || 'Título Indisponível', // Fallback
                        summary: item.summary || item.content?.substring(0, 150) + '...' || 'Resumo Indisponível', // Fallback
                        content: item.content || '',
                        // A data pode vir de 'date', 'updatedAt' ou 'createdAt'
                        date: new Date(item.date || item.updatedAt || item.createdAt).toLocaleDateString('pt-BR'),
                    };
                }).filter(Boolean); // Filtra quaisquer itens nulos

                setHomeWikiArticles(transformedArticles.slice(0, 3)); // Pega os 3 primeiros para a Home
            } catch (err) {
                if (err instanceof Error) { setErrorWiki(err.message); console.error("Erro ao buscar artigos da Wiki do Strapi:", err); } else { setErrorWiki("Ocorreu um erro desconhecido ao buscar artigos da Wiki do Strapi."); console.error("Erro desconhecido ao buscar artigos da Wiki do Strapi:", err); }
            } finally {
                setLoadingWiki(false);
            }
        };
        fetchWikiArticles();
    }, []);

    // Efeito para buscar links na Home do Strapi
    useEffect(() => {
        const fetchLinks = async () => {
            try {
                // CORREÇÃO: Adicionar populate=icon para incluir os dados da imagem
                const response = await fetch(buildStrapiUrl('/links?populate=icon'));
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos de Links do Strapi (Home):", rawData);
                
                // ADICIONE ESTE LOG para ver cada item individualmente
                rawData.data?.forEach((item: any, index: number) => {
                    console.log(`Link ${index}:`, item);
                    console.log(`Icon do Link ${index}:`, item.icon);
                });

                if (!Array.isArray(rawData.data)) {
                    console.error("rawData.data não é um array para links:", rawData.data);
                    setErrorLinks("Formato de dados de links inesperado.");
                    setLoadingLinks(false);
                    return;
                }

                const transformedLinks: UsefulLink[] = rawData.data.map((item: any) => {
                    if (!item || typeof item.id === 'undefined') {
                        console.warn("Item de link inválido ou sem atributos:", item);
                        return null;
                    }

                    // CORREÇÃO: Log detalhado do processamento do ícone
                    console.log('Processando item:', item);
                    console.log('Ícone original:', item.icon);

                    // CORREÇÃO: Extrair URL do ícone corretamente baseado na estrutura do Strapi v5
                    let iconData = null;
                    
                    if (item.icon) {
                        if (item.icon.url) {
                            // Strapi v5 formato direto
                            iconData = `${API_CONFIG.strapi}${item.icon.url}`;
                        } else if (item.icon.data && item.icon.data.attributes && item.icon.data.attributes.url) {
                            // Strapi v4 formato
                            iconData = `${API_CONFIG.strapi}${item.icon.data.attributes.url}`;
                        } else {
                            // Se icon for um objeto complexo, vamos logar para debug
                            console.log('Estrutura do ícone não reconhecida:', item.icon);
                        }
                    }

                    console.log('URL final do ícone:', iconData);

                    return {
                        id: item.id,
                        title: item.title || 'Título Indisponível',
                        url: item.url || '#',
                        icon: iconData, // Usar iconData em vez de iconUrl
                    };
                }).filter(Boolean);

                console.log('Links transformados:', transformedLinks);
                setHomeLinks(transformedLinks.slice(0, 4));
            } catch (err) {
                if (err instanceof Error) { 
                    setErrorLinks(err.message); 
                    console.error("Erro ao buscar links do Strapi:", err); 
                } else { 
                    setErrorLinks("Ocorreu um erro desconhecido ao buscar links do Strapi."); 
                    console.error("Erro desconhecido ao buscar links do Strapi:", err); 
                }
            } finally {
                setLoadingLinks(false);
            }
        };
        fetchLinks();
    }, []);


    // Efeito para buscar Comunicados Oficiais na Home do Strapi
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Adicionado populate=content para incluir os dados da imagem
                const response = await fetch(buildStrapiUrl('/announcements?populate=content'));
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos de Comunicados do Strapi (Home):", rawData);

                if (!Array.isArray(rawData.data)) {
                    console.error("rawData.data não é um array para comunicados:", rawData.data);
                    setErrorAnnouncements("Formato de dados de comunicados inesperado.");
                    setLoadingAnnouncements(false);
                    return;
                }
                if (rawData.data.length === 0) {
                    console.warn("Nenhum comunicado retornado pelo Strapi (Home).");
                }

                const transformedAnnouncements: Announcement[] = rawData.data.map((item: any) => {
                    if (!item || typeof item.id === 'undefined') {
                        console.warn("Item de comunicado inválido ou sem ID:", item);
                        return null;
                    }
                    return {
                        id: item.id.toString(),
                        documentId: item.documentId || item.id.toString(),
                        title: item.title || 'Título Indisponível',
                        content: item.content || null, // <<< Mapeia o objeto de mídia diretamente
                        author: item.author || 'Autor Desconhecido',
                        date: new Date(item.date || item.updatedAt || item.createdAt).toLocaleDateString('pt-BR'),
                    };
                }).filter(Boolean);

                setHomeAnnouncements(transformedAnnouncements.slice(0, 3));
            } catch (err) {
                if (err instanceof Error) { setErrorAnnouncements(err.message); console.error("Erro ao buscar comunicados do Strapi:", err); } else { setErrorAnnouncements("Ocorreu um erro desconhecido ao buscar comunicados."); console.error("Erro desconhecido ao buscar comunicados:", err); }
            } finally {
                setLoadingAnnouncements(false);
            }
        };
        fetchAnnouncements();
    }, []);


    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    const openModal = (type: string) => {
        setModalType(type);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
    };

    const boasPraticas = [
        'Utilize senhas fortes e únicas para cada serviço.',
        'Não compartilhe suas credenciais de acesso com ninguém.',
        'Sempre faça backup de dados importantes, se possível.',
        'Mantenha seu software (antivírus, sistema operacional) sempre atualizado.',
        'Reporte qualquer atividade suspeita ao departamento de TI.',
        'Ao sair do computador, bloqueie a tela (Windows+L).'
    ];

    const tiMembers = [
        { name: 'Adriano Ferreira Barbosa', role: 'Coordenador' },
        { name: 'Matheus Guilherme Ferreira Araújo', role: 'Supervisor' },
        { name: 'Gustavo Maia Moreira', role: 'Assistente' },
        { name: 'Lucas Moraes Aguiar', role: 'Auxiliar' },
    ];

    return (
        <>

            {/* Botão para abrir o modal da TI */}
            <div className="text-right mb-6">
                <button
                    onClick={() => setShowTiModal(true)}
                    className="px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    Boas Práticas de TI
                </button>
            </div>
            <SectionWrapper id="wiki-home" title="Wiki Interna" titleColor="var(--color-funev-blue)" description="Bem-vindo à Wiki da FUNEV! Aqui você encontra informações importantes sobre processos, políticas e procedimentos internos.">
                {loadingWiki && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando artigos da Wiki...</p>
                )}
                {errorWiki && (
                    <p className="text-center" style={{ color: 'red' }}>Erro ao carregar Wiki: {errorWiki}</p>
                )}
                {!loadingWiki && !errorWiki && homeWikiArticles.length === 0 && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum artigo da Wiki disponível.</p>
                )}
                {!loadingWiki && !errorWiki && homeWikiArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homeWikiArticles.map((article: WikiArticle) => (
                            <ArticleCard
                                key={article.documentId}
                                article={article}
                                isSummary={true}
                            />
                        ))}
                    </div>
                )}
                <Link href="/wiki" className="mt-6 px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}>
                    Acessar Wiki Completa
                </Link>
            </SectionWrapper>

            <SectionWrapper id="links-home" title="Links Úteis" titleColor="var(--color-funev-blue)">
                {loadingLinks && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando links...</p>
                )}
                {errorLinks && (
                    <p className="text-center" style={{ color: 'red' }}>Erro ao carregar links: {errorLinks}</p>
                )}
                {!loadingLinks && !errorLinks && homeLinks.length === 0 && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum link disponível.</p>
                )}
                {!loadingLinks && !errorLinks && homeLinks.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {homeLinks.map((link: UsefulLink, index: number) => (
                            <LinkCard key={index} link={link} />
                        ))}
                    </div>
                )}
                <Link href="/links" className="mt-6 px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}>
                    Ver todos os Links
                </Link>
            </SectionWrapper>


            {/* Seção de Comunicados Oficiais na Home */}
            {(loadingAnnouncements || errorAnnouncements || homeAnnouncements.length > 0) && (
                <SectionWrapper id="announcements" title="Comunicados Oficiais" titleColor="var(--color-funev-blue)">
                    {loadingAnnouncements && (
                        <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando comunicados...</p>
                    )}
                    {errorAnnouncements && (
                        <p className="text-center" style={{ color: 'red' }}>Erro ao carregar comunicados: {errorAnnouncements}</p>
                    )}
                    {!loadingAnnouncements && !errorAnnouncements && homeAnnouncements.length === 0 && (
                        <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum comunicado disponível no momento.</p>
                    )}
                    {!loadingAnnouncements && !errorAnnouncements && homeAnnouncements.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {homeAnnouncements.map((announcement: Announcement) => (
                                <AnnouncementCard
                                    key={announcement.id}
                                    announcement={announcement}
                                    isSummary={true}
                                />
                            ))}
                        </div>
                    )}
                    <Link href="/comunicados" className="mt-6 px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}>
                        Ver Todos os Comunicados
                    </Link>
                </SectionWrapper>
            )}

            {/* Seção de Aniversariantes na Home */}
            <SectionWrapper id="birthdays" title="Aniversariantes do Mês" titleColor="var(--color-funev-blue)">
                {loadingBirthdays && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando aniversariantes do mês...</p>
                )}
                {errorBirthdays && (
                    <p className="text-center" style={{ color: 'red' }}>Erro ao carregar aniversariantes: {errorBirthdays}</p>
                )}
                {!loadingBirthdays && !errorBirthdays && currentMonthBirthdays.length === 0 && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum aniversariante este mês.</p>
                )}
                {!loadingBirthdays && !errorBirthdays && currentMonthBirthdays.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentMonthBirthdays.map((person: Birthday, index: number) => (
                            <BirthdayCard key={index} person={person} />
                        ))}
                    </div>
                )}

                <div className="flex justify-between items-center mt-6">
                    {/* Botão para abrir o modal de aniversariantes do dia */}
                    {todayBirthdays.length > 0 && (
                        <button
                            onClick={() => setShowTodayBirthdayModal(true)}
                            className="px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                            style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                            onMouseEnter={(e) => handleButtonHover(e, true)}
                            onMouseLeave={(e) => handleButtonHover(e, false)}
                        >
                            Aniversariantes do Dia
                        </button>
                    )}

                    <Link href="/birthdays" className="px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}>
                        Ver todos os Aniversariantes
                    </Link>
                </div>
            </SectionWrapper>

            {/* Seção de Calendário de Eventos na Home */}
            {(loadingEvents || errorEvents || currentMonthEvents.length > 0) && ( // Renderiza a seção inteira condicionalmente
                <SectionWrapper id="calendar" title="Calendário de Eventos" titleColor="var(--color-funev-blue)">
                    {loadingEvents && (
                        <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando eventos do mês...</p>
                    )}
                    {errorEvents && (
                        <p className="text-center" style={{ color: 'red' }}>Erro ao carregar eventos: {errorEvents}</p>
                    )}
                    {!loadingEvents && !errorEvents && currentMonthEvents.length === 0 && (
                        <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum evento este mês.</p>
                    )}
                    {!loadingEvents && !errorEvents && currentMonthEvents.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentMonthEvents.map((event: Event, index: number) => (
                                <EventCard key={index} event={event} />
                            ))}
                        </div>
                    )}
                    <Link href="/calendar" className="mt-6 px-6 py-3 rounded-md shadow-md inline-block transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}>
                        Ver Calendário Completo
                    </Link>
                </SectionWrapper>
            )}

            {/* Modal de Boas Práticas de TI */}
            <Modal show={showTiModal} onClose={() => setShowTiModal(false)} title="Boas Práticas de TI">
                <ul className="list-disc list-inside space-y-2 text-left" style={{ color: 'var(--color-funev-dark)' }}>
                    {boasPraticas.map((pratica, index) => (
                        <li key={index}>{pratica}</li>
                    ))}
                </ul>
            </Modal>

            {/*Modal de Aniversariantes do Dia */}
            <Modal show={showTodayBirthdayModal} onClose={() => setShowTodayBirthdayModal(false)} title="Aniversariantes do Dia">
                {loadingBirthdays && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando...</p>
                )}
                {errorBirthdays && (
                    <p className="text-center" style={{ color: 'red' }}>Erro: {errorBirthdays}</p>
                )}
                {!loadingBirthdays && !errorBirthdays && todayBirthdays.length === 0 && (
                    <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum aniversariante hoje.</p>
                )}
                {!loadingBirthdays && !errorBirthdays && todayBirthdays.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                        {todayBirthdays.map((person: Birthday, index: number) => (
                            <BirthdayCard key={index} person={person} />
                        ))}
                    </div>
                )}
            </Modal>
        </>
    );
}