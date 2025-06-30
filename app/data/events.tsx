// app/data/events.ts

export interface Event {
    title: string;
    date: string;
    time: string;
    location: string;
    topic: string;
}

export const allEvents: Event[] = [
    { title: 'Reunião Geral', date: '10 de Julho de 2025', time: '09:00 - 11:00', location: 'Auditório Principal', topic: 'Planejamento Estratégico Q3' },
    { title: 'Treinamento de Segurança', date: '15 de Julho de 2025', time: '14:00 - 16:00', location: 'Sala de Treinamento 1', topic: 'Obrigatório para todos os colaboradores.' },
    { title: 'Almoço de Confraternização', date: '25 de Julho de 2025', time: '12:00 - 14:00', location: 'Refeitório', topic: 'Comemoração dos aniversariantes do mês.' },
    { title: 'Workshop de Inovação', date: '05 de Agosto de 2025', time: '09:00 - 17:00', location: 'Centro de Convenções', topic: 'Novas tendências e tecnologias.' },
    { title: 'Campanha de Doação de Sangue', date: '20 de Agosto de 2025', time: '08:00 - 12:00', location: 'Prédio Administrativo', topic: 'Participe e salve vidas!' },
    { title: 'Treinamento de Primeiros Socorros', date: '02 de Setembro de 2025', time: '09:00 - 12:00', location: 'Sala de Treinamento 2', topic: 'Aprenda a agir em emergências.' },
    { title: 'Dia da Família FUNEV', date: '15 de Setembro de 2025', time: '10:00 - 17:00', location: 'Parque da Cidade', topic: 'Atividades para toda a família.' },
];