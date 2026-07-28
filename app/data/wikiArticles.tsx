// app/data/wikiArticles.ts

export interface StrapiMedia {
    id: number;
    name: string;
    url: string; // A URL relativa do ficheiro
    width?: number;
    height?: number;
    formats?: any;
    mime?: string;
    size?: number;
}

export interface WikiArticle {
    id: string;
    documentId: string;
    title: string;
    summary: string;
    content: string; // Este campo já contém as imagens como HTML quando feitas via CKEditor
    date: string;
    pdf?: StrapiMedia | null; // PDF associado ao artigo, se houver
    
    // Campos opcionais para imagens específicas
    featuredImage?: StrapiMedia | null; // Imagem de destaque do artigo
    gallery?: StrapiMedia[] | null; // Galeria de imagens do artigo
    
    // Metadados adicionais úteis
    author?: string;
    category?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
}