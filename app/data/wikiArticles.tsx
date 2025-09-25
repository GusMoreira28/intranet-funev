// app/data/wikiArticles.ts

export interface StrapiMedia {
    id: number;
    name: string;
    url: string; // A URL relativa do ficheiro
    width?: number;
    height?: number;
    formats?: any;
    // Adicione outras propriedades se precisar
}

export interface WikiArticle {
    id: string;
    documentId: string;
    title: string;
    summary: string;
    content: string; // Este campo já contém as imagens como HTML quando feitas via CKEditor
    date: string;
    
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