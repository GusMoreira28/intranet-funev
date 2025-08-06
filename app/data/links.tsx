// app/data/links.ts

// Interface para o objeto de mídia retornado pelo Strapi
export interface StrapiMedia {
    id: number;
    name: string;
    url: string; // A URL relativa do ficheiro
}

export interface UsefulLink {
    title: string;
    url: string;
    icon: StrapiMedia | null;
}
