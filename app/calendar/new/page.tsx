// app/calendar/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SectionWrapper from '../../components/SectionWrapper';
import { isAuthenticated, getToken } from '../../auth'; // Importa funções de autenticação
import { buildStrapiUrl } from '@/app/config/api';

export default function NewEventPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = getToken(); // Obtém o token JWT
        if (!token) {
            setError('Sessão expirada ou credenciais ausentes. Por favor, faça login novamente.');
            setLoading(false);
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(buildStrapiUrl('/api/events'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // <<< CRÍTICO: Inclui o token JWT no cabeçalho
                },
                body: JSON.stringify({
                    data: {
                        title,
                        date,
                        time,
                        location,
                        topic,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Credenciais inválidas ou permissão negada. Verifique seu login e permissões no Strapi.');
                }
                throw new Error(errorData.error?.message || `Falha ao adicionar evento: ${response.statusText}`);
            }

            setSuccess('Evento adicionado com sucesso!');
            setTitle('');
            setDate('');
            setTime('');
            setLocation('');
            setTopic('');
            router.push('/calendar');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido ao adicionar o evento.');
            }
            console.error('Erro na submissão do evento:', err);
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
        <SectionWrapper title="Adicionar Novo Evento" titleColor="var(--color-funev-blue)" >
            <button
                onClick={() => router.push('/calendar')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para Eventos
            </button>

            <div className=" mx-auto p-6 bg-white rounded-lg shadow-md"
                style={{ backgroundColor: 'var(--color-funev-light)', border: '1px solid var(--color-funev-green)' }}>
                <form onSubmit={handleSubmit} className="space-y-4 ">
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
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700"
                                style={{ color: 'var(--color-funev-dark)' }}>
                                Data:
                            </label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700"
                                style={{ color: 'var(--color-funev-dark)' }}>
                                Hora:
                            </label>
                            <input
                                type="text"
                                id="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700"
                                style={{ color: 'var(--color-funev-dark)' }}>
                                Local:
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700"
                            style={{ color: 'var(--color-funev-dark)' }}>
                            Tópico:
                        </label>
                        <textarea
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        ></textarea>
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
                        {loading ? 'Adicionando...' : 'Adicionar Evento'}
                    </button>
                </form>
            </div>
        </SectionWrapper>
    );
}