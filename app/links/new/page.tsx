// app/links/new/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SectionWrapper from '../../components/SectionWrapper';
import { isAuthenticated, getToken } from '../../auth';
import { buildStrapiUrl } from '@/app/config/api';

export default function NewLinkPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<File | null>(null); // Estado para o ficheiro do ícone
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const iconFileInputRef = useRef<HTMLInputElement>(null); // Ref para o input de arquivo do ícone

    useEffect(() => {
        // Redireciona se não estiver logado
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    // Manipulador para o input de arquivo do ícone
    const handleIconFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedIcon(event.target.files[0]);
            setError(null); // Limpa erro ao selecionar novo arquivo
        } else {
            setSelectedIcon(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = getToken(); // Obtém o token JWT do localStorage
        if (!token) {
            setError('Sessão expirada ou credenciais ausentes. Por favor, faça login novamente.');
            setLoading(false);
            router.push('/login');
            return;
        }

        if (!selectedIcon) {
            setError('Por favor, selecione uma imagem para o ícone do link.');
            setLoading(false);
            return;
        }

        let uploadedIconId: number | null = null; // Para armazenar o ID do ícone carregado

        try {
            // --- 1. UPLOAD DA IMAGEM DO ÍCONE PARA A MEDIA LIBRARY DO STRAPI ---
            const iconFormData = new FormData();
            iconFormData.append('files', selectedIcon);

            console.log("Iniciando upload do ícone para Strapi...");
            const uploadIconResponse = await fetch(buildStrapiUrl('/api/upload'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Autentica o upload
                },
                body: iconFormData,
            });

            if (!uploadIconResponse.ok) {
                const errorText = await uploadIconResponse.text();
                console.error('Upload de Ícone: Resposta de erro bruta:', errorText);
                throw new Error(`Falha no upload do ícone: ${uploadIconResponse.status} ${uploadIconResponse.statusText}`);
            }

            const uploadIconData = await uploadIconResponse.json();
            console.log("Dados de upload do ícone recebidos:", uploadIconData);

            if (uploadIconData && Array.isArray(uploadIconData) && uploadIconData[0] && typeof uploadIconData[0].id === 'number') {
                uploadedIconId = uploadIconData[0].id; // Obtém o ID numérico do ícone carregado
                console.log("ID do ícone carregado:", uploadedIconId);
            } else {
                throw new Error('Upload de Ícone: Resposta inesperada do Strapi (ID do ícone não encontrado).');
            }

            // --- 2. CRIAÇÃO DO LINK COM O ID DO ÍCONE ---
            const payload = {
                data: { // Strapi espera os dados dentro de um objeto 'data'
                    title,
                    url,
                    icon: uploadedIconId, // O ícone agora é o ID do ficheiro de mídia
                },
            };
            console.log("Payload enviado para o Strapi (Link):", payload);

            const response = await fetch(buildStrapiUrl('/api/links'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Inclui o token JWT
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Credenciais inválidas ou permissão negada. Verifique seu login e permissões no Strapi.');
                }
                throw new Error(errorData.error?.message || `Falha ao adicionar link: ${response.statusText}`);
            }

            setSuccess('Link adicionado com sucesso!');
            setTitle('');
            setUrl('');
            setSelectedIcon(null);
            if (iconFileInputRef.current) {
                iconFileInputRef.current.value = ''; // Limpa visualmente o input de arquivo
            }
            router.push('/links'); // Redireciona para a lista de links após o sucesso

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido ao adicionar o link.');
            }
            console.error('Erro na submissão do link:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    return (
        <SectionWrapper title="Adicionar Novo Link Útil" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/links')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para Links
            </button>

            <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md"
                 style={{ backgroundColor: 'var(--color-funev-light)', border: '1px solid var(--color-funev-green)' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Título:
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            URL:
                        </label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="icon" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Ícone do Link (Imagem):
                        </label>
                        <input
                            type="file"
                            id="icon"
                            ref={iconFileInputRef}
                            onChange={handleIconFileChange}
                            accept="image/*"
                            required
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-funev-green file:text-funev-white hover:file:bg-funev-blue"
                        />
                        {selectedIcon && (
                            <p className="text-sm mt-2" style={{ color: 'var(--color-funev-dark)' }}>
                                Ficheiro selecionado: {selectedIcon.name}
                            </p>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-300"
                        style={{ backgroundColor: 'var(--color-funev-blue)' }}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        {loading ? 'Adicionando...' : 'Adicionar Link'}
                    </button>
                </form>
            </div>
        </SectionWrapper>
    );
}