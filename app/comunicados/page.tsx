// app/comunicados/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Announcement } from '../data/announcements';
import AnnouncementCard from '../components/AnnouncementCard';
import SectionWrapper from '../components/SectionWrapper';
import { isAuthenticated } from '../auth'; // Para botão de adicionar
import { buildStrapiUrl, API_CONFIG } from '../config/api';

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch(buildStrapiUrl('/announcements?populate=content'));
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos de Comunicados do Strapi (Lista):", rawData);

                if (!Array.isArray(rawData.data)) {
                    console.error("rawData.data não é um array para comunicados:", rawData.data);
                    setError("Formato de dados de comunicados inesperado.");
                    setLoading(false);
                    return;
                }

                const transformedAnnouncements: Announcement[] = rawData.data.map((item: any) => {
                    if (!item || typeof item.id === 'undefined') {
                        console.warn("Item de comunicado inválido ou sem ID:", item);
                        return null;
                    }

                    let contentData = null;

                    if (item.content) {
                        if (item.content.url) {
                            // Strapi v5 formato direto
                            contentData = `${API_CONFIG.strapi}${item.content.url}`;
                        } else if (item.content.data && item.content.data.attributes && item.content.data.attributes.url) {
                            // Strapi v4 formato
                            contentData = `${API_CONFIG.strapi}${item.content.data.attributes.url}`;
                        } else {
                            // Se content for um objeto complexo, vamos logar para debug
                            console.log('Estrutura do conteúdo não reconhecida (Comunicados Page):', item.content);
                        }
                    }

                    console.log('URL final do conteúdo (Comunicados Page):', contentData);
                    // Mapeamento direto dos campos
                    return {
                        id: item.id.toString(),
                        documentId: item.documentId || item.id.toString(),
                        title: item.title || 'Título Indisponível',
                        content: contentData || null, // <<< content agora é o objeto de mídia
                        author: item.author || 'Autor Desconhecido',
                        date: new Date(item.date || item.updatedAt || item.createdAt).toLocaleDateString('pt-BR'),
                    };
                }).filter(Boolean);

                setAnnouncements(transformedAnnouncements);
            } catch (err) {
                if (err instanceof Error) { setError(err.message); console.error("Erro ao buscar comunicados:", err); } else { setError("Ocorreu um erro desconhecido ao buscar comunicados."); console.error("Erro desconhecido ao buscar comunicados:", err); }
            } finally {
                setLoading(false);
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

    return (
        <SectionWrapper title="Comunicados Oficiais" titleColor="var(--color-funev-blue)">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    &larr; Voltar para a Home
                </button>
                {isLoggedIn && (
                    <Link href="/comunicados/new" className="px-6 py-3 rounded-md shadow-md transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}>
                        + Adicionar Novo Comunicado
                    </Link>
                )}
            </div>

            {loading && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando comunicados...</p>
            )}
            {error && (
                <p className="text-center" style={{ color: 'red' }}>Erro ao carregar comunicados: {error}</p>
            )}
            {!loading && !error && announcements.length === 0 && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum comunicado disponível.</p>
            )}
            {!loading && !error && announcements.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((announcement: Announcement) => (
                        <AnnouncementCard
                            key={announcement.id}
                            announcement={announcement}
                            isSummary={false} // Mantém como false para exibir a imagem completa
                        />
                    ))}
                </div>
            )}
        </SectionWrapper>
    );
}