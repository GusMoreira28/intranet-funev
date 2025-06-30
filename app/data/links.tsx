// app/data/links.ts

export interface UsefulLink {
    title: string;
    description: string;
    url: string;
}

export const usefulLinks: UsefulLink[] = [
    {
        title: 'Site Principal FUNEV',
        description: 'Acesse o site oficial da Fundação Educativa Evangélica.',
        url: 'https://funev.org.br'
    },
    {
        title: 'Sistema de RH',
        description: 'Portal para informações de contracheque e benefícios.',
        url: '#'
    },
    {
        title: 'E-mail Corporativo',
        description: 'Acesso ao seu e-mail profissional.',
        url: '#'
    },
    {
        title: 'Documentos Google/Microsoft 365',
        description: 'Acesse a plataforma de colaboração de documentos.',
        url: '#'
    },
    {
        title: 'Central de Atendimento ao Colaborador',
        description: 'Entre em contato com o suporte para dúvidas e solicitações.',
        url: '#'
    },
    {
        title: 'Políticas Internas',
        description: 'Documentos com as políticas e diretrizes da instituição.',
        url: '#'
    }
];