// app/data/wikiArticles.ts

export interface WikiArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
    date: string;
}

export const wikiArticlesData: WikiArticle[] = [
    {
        id: 'hr-policies',
        title: 'Políticas de Recursos Humanos',
        summary: 'Este documento detalha as políticas de RH da FUNEV, incluindo contratação, benefícios, avaliação de desempenho e desligamento...',
        content: 'Este documento detalha as políticas de RH da FUNEV, incluindo contratação, benefícios, avaliação de desempenho e desligamento. É fundamental para todos os colaboradores entenderem seus direitos e responsabilidades dentro da organização. Consulte as seções de férias, licenças e plano de carreira para informações detalhadas. Além disso, abrange o código de conduta e ética, garantindo um ambiente de trabalho justo e transparente para todos. As atualizações serão comunicadas via intranet e e-mail corporativo.',
        date: 'Atualizado em: 15/05/2025'
    },
    {
        id: 'info-security',
        title: 'Guia de Segurança da Informação',
        summary: 'Nosso guia de segurança da informação aborda as melhores práticas para proteger dados sensíveis, evitar ataques de phishing...',
        content: 'Nosso guia de segurança da informação aborda as melhores práticas para proteger dados sensíveis, evitar ataques de phishing e garantir a conformidade com as normas de privacidade. Todos os funcionários devem seguir estas diretrizes para manter a segurança de nossa rede e informações. Inclui dicas sobre senhas seguras e uso de VPN. A conscientização sobre cibersegurança é um pilar essencial para a proteção de nossos ativos digitais e a confidencialidade de dados de colaboradores e parceiros.',
        date: 'Atualizado em: 01/06/2025'
    },
    {
        id: 'it-support',
        title: 'Procedimentos de Manutenção e Suporte Técnico',
        summary: 'Esta seção descreve os passos para solicitar suporte técnico para equipamentos, software ou problemas de rede...',
        content: 'Esta seção descreve os passos para solicitar suporte técnico para equipamentos, software ou problemas de rede. Inclui contatos de emergência e horários de atendimento. Também aborda procedimentos para manutenção preventiva e o uso do sistema de chamados. Saiba como otimizar o desempenho de suas ferramentas de trabalho e o que fazer em caso de falhas inesperadas. Nosso time de TI está pronto para auxiliar e garantir a continuidade de suas atividades.',
        date: 'Atualizado em: 10/06/2025'
    },
    {
        id: 'corporate-travel',
        title: 'Normas de Viagens Corporativas',
        summary: 'Conheça as regras e procedimentos para viagens a trabalho, incluindo solicitação de adiantamento, prestação de contas de despesas...',
        content: 'Conheça as regras e procedimentos para viagens a trabalho, incluindo solicitação de adiantamento, prestação de contas de despesas e aprovação de itinerários. Garanta que todas as suas viagens estejam em conformidade com as políticas da FUNEV. Informações sobre passagens aéreas e hospedagem também estão disponíveis. A política visa otimizar custos e garantir a segurança e o conforto de nossos colaboradores em deslocamento.',
        date: 'Atualizado em: 20/05/2025'
    }
];