// app/comunicados/[slug]/AnnouncementContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement } from '../../data/announcements';
import SectionWrapper from '../../components/SectionWrapper';
import Image from 'next/image'; // Importa Image
import { buildStrapiUrl, API_CONFIG } from '@/app/config/api';


interface AnnouncementContentProps {
    slug: string; // Recebe o slug (que é o documentId) como prop
}

const AnnouncementContent: React.FC<AnnouncementContentProps> = ({ slug }) => {
    const router = useRouter();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(true);
    const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setErrorAnnouncements("Slug do comunicado não fornecido.");
            setLoadingAnnouncements(false);
            return;
        }

        const fetchAnnouncement = async () => {
            try {
                // Busca um comunicado específico pelo documentId via filtro
                const response = await fetch(buildStrapiUrl('/announcements?populate=content'));
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos de Comunicados do Strapi (Lista):", rawData);

                if (!Array.isArray(rawData.data)) {
                    console.error("rawData.data não é um array para comunicados:", rawData.data);
                    setErrorAnnouncements("Formato de dados de comunicados inesperado.");
                    setLoadingAnnouncements(false);
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
                        description: item.description || 'Descrição Indisponível',
                    };
                }).filter(Boolean);

                // Encontra o comunicado pelo slug (documentId)
                const foundAnnouncement = transformedAnnouncements.find(a => a.documentId === slug);
                setAnnouncement(foundAnnouncement || null);

            } catch (err) {
                if (err instanceof Error) { setErrorAnnouncements(err.message); console.error("Erro ao buscar comunicado:", err); } else { setErrorAnnouncements("Ocorreu um erro desconhecido ao buscar comunicado."); console.error("Erro desconhecido ao buscar comunicado.", err); }
            } finally {
                setLoadingAnnouncements(false);
            }
        };
        fetchAnnouncement();
    }, [slug]);

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    if (loadingAnnouncements) {
        return (
            <SectionWrapper title="Carregando Comunicado..." titleColor="var(--color-funev-blue)">
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Aguarde...</p>
            </SectionWrapper>
        );
    }

    if (errorAnnouncements) {
        return (
            <SectionWrapper title="Erro ao Carregar Comunicado" titleColor="red">
                <p className="text-center" style={{ color: 'red' }}>{errorAnnouncements}</p>
                <button
                    onClick={() => router.push('/comunicados')}
                    className="mt-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    &larr; Voltar para Comunicados
                </button>
            </SectionWrapper>
        );
    }

    if (!announcement) {
        return (
            <SectionWrapper title="Comunicado Não Encontrado" titleColor="var(--color-funev-dark)">
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>O comunicado que você procura não foi encontrado.</p>
                <button
                    onClick={() => router.push('/comunicados')}
                    className="mt-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                    &larr; Voltar para Comunicados
                </button>
            </SectionWrapper>
        );
    }

    return (
        <SectionWrapper title={announcement.title} titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/comunicados')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para Comunicados
            </button>
            <p className="text-sm italic mb-6" style={{ color: 'var(--color-funev-dark)' }}>
                Por {announcement.author} em {announcement.date}
            </p>
            {/* Renderiza a imagem do comunicado */}
            {announcement.content && announcement.content.url && ( // Verifica se content e content.url existem
                <div className="relative w-full h-200 mb-3 rounded-md overflow-hidden">
                    <Image
                        src={`http://localhost:1337${announcement.content.url}`}
                        alt={announcement.title}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                    />
                </div>
            )}
        </SectionWrapper>
    );
};

export default AnnouncementContent;