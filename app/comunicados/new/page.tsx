// app/comunicados/new/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SectionWrapper from '../../components/SectionWrapper';
import { isAuthenticated, getToken } from '../../auth';
import { buildStrapiUrl } from '@/app/config/api';

export default function NewAnnouncementPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null); // Estado para o ficheiro de imagem
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null); // Ref para o input de arquivo

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    // Manipulador para o input de arquivo
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]);
            setError(null); // Limpa erro ao selecionar novo arquivo
        } else {
            setSelectedImage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = getToken();
        if (!token) {
            setError('Sessão expirada ou credenciais ausentes. Por favor, faça login novamente.');
            setLoading(false);
            router.push('/login');
            return;
        }

        if (!selectedImage) {
            setError('Por favor, selecione uma imagem para o comunicado.');
            setLoading(false);
            return;
        }

        const documentId = 'comunicado-' + Date.now(); // Gera um ID único simples para o documento
        const currentDate = new Date().toISOString(); // Obtém a data atual no formato ISO
        let uploadedFileId: number | null = null; // <<< NOVO: Para armazenar o ID do arquivo carregado

        try {
            // --- 1. UPLOAD DA IMAGEM PARA A MEDIA LIBRARY DO STRAPI ---
            const formData = new FormData();
            formData.append('files', selectedImage);

            console.log("Iniciando upload de imagem para Strapi...");
            const uploadResponse = await fetch('http://localhost:1337/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Autentica o upload
                },
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Upload de Imagem: Resposta de erro bruta:', errorText);
                throw new Error(`Falha no upload da imagem: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            const uploadData = await uploadResponse.json();
            console.log("Dados de upload da imagem recebidos:", uploadData);

            if (uploadData && Array.isArray(uploadData) && uploadData[0] && typeof uploadData[0].id === 'number') {
                uploadedFileId = uploadData[0].id; // <<< AQUI: Obtém o ID numérico do arquivo carregado
                console.log("ID do arquivo carregado:", uploadedFileId);
            } else {
                throw new Error('Upload de Imagem: Resposta inesperada do Strapi (ID do arquivo não encontrado).');
            }

            // --- 2. CRIAÇÃO DO COMUNICADO COM O ID DA IMAGEM ---
            const payload = {
                data: {
                    title,
                    content: uploadedFileId, // <<< AQUI: O conteúdo agora é o ID do arquivo de mídia
                    author,
                    date: currentDate,
                },
            };
            console.log("Payload enviado para o Strapi (Comunicado):", payload);

            const response = await fetch(buildStrapiUrl('/api/announcements'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Credenciais inválidas ou permissão negada. Verifique seu login e permissões no Strapi.');
                }
                throw new Error(errorData.error?.message || `Falha ao adicionar comunicado: ${response.statusText}`);
            }

            setSuccess('Comunicado adicionado com sucesso!');
            setTitle('');
            setAuthor('');
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            router.push('/comunicados');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido ao adicionar o comunicado.');
            }
            console.error('Erro na submissão do comunicado:', err);
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
        <SectionWrapper title="Adicionar Novo Comunicado" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/comunicados')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para Comunicados
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
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Autor:
                        </label>
                        <input
                            type="text"
                            id="author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Imagem do Comunicado:
                        </label>
                        <input
                            type="file"
                            id="content"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-funev-green file:text-funev-white hover:file:bg-funev-blue"
                        />
                        {selectedImage && (
                            <p className="text-sm mt-2" style={{ color: 'var(--color-funev-dark)' }}>
                                Ficheiro selecionado: {selectedImage.name}
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
                        {loading ? 'Adicionando...' : 'Adicionar Comunicado'}
                    </button>
                </form>
            </div>
        </SectionWrapper>
    );
}