// app/data/announcements.ts

// Interface para o objeto de mídia retornado pelo Strapi
export interface StrapiMedia {
    id: number;
    name: string;
    url: string; // A URL relativa do ficheiro
    // Adicione outras propriedades se precisar (width, height, formats, etc.)
}

export interface Announcement {
    id: string;
    documentId: string;
    title: string;
    content: StrapiMedia | null;
    author: string;
    date: string;
    description: string;
}