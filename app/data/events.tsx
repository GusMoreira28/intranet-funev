// app/data/events.ts
export interface StrapiMedia {
    id: number;
    name: string;
    url: string; // A URL relativa do ficheiro
    // Adicione outras propriedades se precisar (width, height, formats, etc.)
}

export interface Event {
    documentId: string;
    title: string;
    date: string;
    banner: StrapiMedia | null;
}