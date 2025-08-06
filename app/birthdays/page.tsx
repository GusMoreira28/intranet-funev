// app/components/BirthdaysPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Birthday, RawApiBirthday } from '../data/birthdays';
import BirthdayCard from '../components/BirthdayCard';
import SectionWrapper from '../components/SectionWrapper';

export default function BirthdaysPage() {
    const router = useRouter();
    const [birthdays, setBirthdays] = useState<Birthday[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Função para extrair as iniciais dos nomes
    const getInitials = (fullName: string): string => {
        const names = fullName.split(' ').filter(name => name.length > 0);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        var initials = (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        return initials;
    }

    // Função para obter nome do mês
    const getMonthName = (dateString: string): string => {
        const parts = dateString.split('/');
        if (parts.length !== 3) return ''
        const monthIndex = parseInt(parts[1], 10);
        if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > 12) return '';

        // Atribua uma data ficticia, para obter o nome do mês
        const date = new Date(2023, monthIndex - 1, 1);
        return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
    }

    // Função auxiliar para gerenciar hover em botões
    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
        if (isHovering) {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-dark)';
        } else {
            e.currentTarget.style.backgroundColor = 'var(--color-funev-blue)';
        }
    };

    // Função para coletar dados
    useEffect(() => {
        const fetchBirthdays = async () => {
            try {
                // Endpoint da API
                const response = await fetch('http://localhost:8000/colaborador');
                if (!response.ok) {
                    throw new Error('Erro ao buscar aniversariantes');
                }

                // Recebe os dados da API
                const rawData: RawApiBirthday[] = await response.json();
                console.log('Dados brutos recebidos da API:', rawData); // DEBUG: Veja o que a API está retornando

                // Transforma os dados recebidos em um formato mais amigável
                const transformedData: Birthday[] = rawData.map(item => {
                    const day = item.data.substring(0, 2);
                    const monthName = getMonthName(item.data);
                    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

                    return {
                        name: item.nome,
                        date: `${day} de ${capitalizedMonthName}`,
                        photo: getInitials(item.nome),
                        month: capitalizedMonthName,
                        role: item.cargo || 'Cargo Indisponível'
                    };
                });
                
                console.log('Dados transformados para o frontend:', transformedData); // DEBUG: Veja os dados após a transformação
                setBirthdays(transformedData); 

            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                    console.error('Erro ao buscar aniversariantes:', error.message);
                } else {
                    setError('Erro desconhecido ao buscar aniversariantes');
                    console.error('Erro desconhecido ao buscar aniversariantes:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBirthdays();
    }, []);

    // Organiza os aniversariantes por mês
    const groupedBirthdays = birthdays.reduce((acc, person) => {
        const month = person.month;
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(person);
        return acc;

    }, {} as Record<string, Birthday[]>);

    const monthOrder = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <SectionWrapper title="Aniversariantes - Todos os Meses" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para a Home
            </button>

            {loading && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Carregando aniversariantes...</p>
            )}

            {error && (
                <p className="text-center" style={{ color: 'red' }}>Erro ao carregar dados: {error}</p>
            )}

            {!loading && !error && Object.keys(groupedBirthdays).length === 0 && (
                <p className="text-center" style={{ color: 'var(--color-funev-dark)' }}>Nenhum aniversariante registrado ainda.</p>
            )}

            {!loading && !error && Object.keys(groupedBirthdays).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {monthOrder.map(month => (
                        groupedBirthdays[month] && groupedBirthdays[month].length > 0 && (
                            <div key={month} className="mb-8 p-4 rounded-lg shadow-sm"
                                 style={{ backgroundColor: 'var(--color-funev-light)' }}>
                                <h3 className="text-xl font-bold mb-4 pb-2 border-b-2"
                                    style={{ color: 'var(--color-funev-green)', borderColor: 'var(--color-funev-light)' }}>
                                    {month}
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {groupedBirthdays[month].map((person: Birthday, index: number) => (
                                        <BirthdayCard key={index} person={person} />
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </SectionWrapper>
    );
}
