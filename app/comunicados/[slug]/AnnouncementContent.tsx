// app/comunicados/[slug]/AnnouncementContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement } from '../../data/announcements';
import SectionWrapper from '../../components/SectionWrapper';
import Image from 'next/image'; // Importa Image
import { buildStrapiUrl } from '@/app/config/api';

interface AnnouncementContentProps {
    slug: string; // Recebe o slug (que é o documentId) como prop
}

const AnnouncementContent: React.FC<AnnouncementContentProps> = ({ slug }) => {
    const router = useRouter();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError("Slug do comunicado não fornecido.");
            setLoading(false);
            return;
        }

        const fetchAnnouncement = async () => {
            try {
                // Busca um comunicado específico pelo documentId via filtro
                const response = await fetch(buildStrapiUrl(`/api/announcements?populate=content&filters[documentId][$eq]=${slug}`));
                if (!response.ok) {
                    if (response.status === 404) {
                        setAnnouncement(null);
                        return;
                    }
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const rawData = await response.json();
                console.log("Dados brutos do Comunicado do Strapi (Single Page):", rawData);

                if (!rawData.data || rawData.data.length === 0) {
                    setAnnouncement(null);
                    return;
                }

                const item = rawData.data[0]; // Pega o primeiro item do array retornado pelo filtro

                const transformedAnnouncement: Announcement = {
                    id: item.id.toString(),
                    documentId: item.documentId || item.id.toString(),
                    title: item.title || 'Título Indisponível',
                    content: item.content || null, // <<< content agora é o objeto de mídia ou null
                    author: item.author || 'Autor Desconhecido',
                    date: new Date(item.date || item.updatedAt || item.createdAt).toLocaleDateString('pt-BR'),
                };
                setAnnouncement(transformedAnnouncement);

            } catch (err) {
                if (err instanceof Error) { setError(err.message); console.error("Erro ao buscar comunicado:", err); } else { setError("Ocorreu um erro desconhecido ao buscar comunicado."); console.error("Erro desconhecido ao buscar comunicado.", err); }
            } finally {
                setLoading(false);
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

    if (loading) {
        return (
            <SectionWrapper title="Carregando Comunicado..." titleColor="var(--color-funev-blue)">
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Aguarde...</p>
            </SectionWrapper>
        );
    }

    if (error) {
        return (
            <SectionWrapper title="Erro ao Carregar Comunicado" titleColor="red">
                <p className="text-center" style={{ color: 'red' }}>{error}</p>
                <button
                    onClick={() => router.push('/comunicados')}
                    className="mt-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                    style={{ backgroundColor: 'var(--color-funev-green)', color: 'var(--color-funev-white)' }}
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
                    style={{ backgroundColor: 'var(--color-funev-green)', color: 'var(--color-funev-white)' }}
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