// app/wiki/new/page.tsx
'use client'; // Mantém como Client Component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SectionWrapper from '../../components/SectionWrapper';
import { isAuthenticated, getToken } from '../../auth';

// Importa 'dynamic' do Next.js
import dynamic from 'next/dynamic';

// Importa os tipos do CKEditor para uso no código
import { CKEditor as CKEditorComponent } from '@ckeditor/ckeditor5-react';
import { EditorConfig } from '@ckeditor/ckeditor5-core'; // Para tipagem do config

// Carrega o componente CKEditor dinamicamente e desabilita SSR.
// O ClassicEditor será importado *dentro* do `then` para garantir que só ocorra no cliente.
const CKEditor = dynamic(
    async () => {
        // Importa ClassicEditor APENAS NO CLIENTE
        const editorModule = await import('@ckeditor/ckeditor5-build-classic');
        const ClassicEditor = editorModule.default;

        // Retorna o componente CKEditor do pacote @ckeditor/ckeditor5-react
        const { CKEditor: ImportedCKEditor } = await import('@ckeditor/ckeditor5-react');

        // Retorna um componente wrapper para passar o ClassicEditor corretamente
        // Isso resolve o problema de tipagem e garante que ClassicEditor seja passado
        // como uma classe, não como um tipo.
        const EditorWrapper = (props: any) => {
            return <ImportedCKEditor editor={ClassicEditor} {...props} />;
        };
        return EditorWrapper;
    },
    { 
        ssr: false, // CRÍTICO: Desabilita a renderização no servidor para este componente
        loading: () => <p style={{color: 'var(--color-funev-dark)'}}>Carregando editor de conteúdo...</p> 
    }
);


export default function NewWikiArticlePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState(''); // Conteúdo HTML do editor
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    // Configuração do Plugin de Upload de Imagem para o CKEditor
    class MyCustomUploadAdapter {
        loader: any;
        constructor(loader: any) {
            this.loader = loader;
        }

        upload() {
            return this.loader.file
                .then((file: File) => new Promise((resolve, reject) => {
                    const formData = new FormData();
                    formData.append('files', file); // 'files' é o nome do campo que o Strapi espera para upload

                    const token = getToken(); // Obtém o token JWT para autenticar o upload
                    if (!token) {
                        console.error('MyCustomUploadAdapter: Token de autenticação ausente.');
                        reject('Token de autenticação ausente para upload.');
                        return;
                    }

                    console.log('MyCustomUploadAdapter: Tentando upload para Strapi...');
                    fetch('http://localhost:1337/api/upload', { // Endpoint de upload do Strapi
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`, // Inclui o token JWT
                        },
                        body: formData,
                    })
                    .then(response => {
                        console.log('MyCustomUploadAdapter: Resposta do upload - Status:', response.status, 'StatusText:', response.statusText);
                        if (!response.ok) {
                            return response.text().then(text => {
                                console.error('MyCustomUploadAdapter: Resposta de erro bruta:', text);
                                throw new Error(`Falha no upload da imagem: ${response.status} ${response.statusText} - ${text.substring(0, 100)}...`);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data && Array.isArray(data) && data[0] && data[0].url) {
                            resolve({
                                default: `http://localhost:1337${data[0].url}` // URL completa da imagem hospedada pelo Strapi
                            });
                        } else {
                            reject('Falha no upload da imagem para o Strapi: Resposta inesperada.');
                        }
                    })
                    .catch(error => {
                        console.error('MyCustomUploadAdapter: Erro no upload da imagem para o Strapi:', error);
                        reject('Erro no upload da imagem: ' + (error.message || 'Erro desconhecido.'));
                    });
                }));
        }

        abort() {
            // Implementar lógica de abortar upload, se necessário
        }
    }

    // A função MyCustomUploadAdapterPlugin precisa ser definida aqui,
    // pois ela é usada na configuração do CKEditor.
    // Certifique-se de que 'editor' é tipado corretamente se o TypeScript reclamar.
    function MyCustomUploadAdapterPlugin(editor: any) { // 'any' para simplicidade com tipagem complexa do CKEditor
        editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
            return new MyCustomUploadAdapter(loader);
        };
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const token = getToken();
        if (!token) {
            setError('Sessão expirada ou credenciais ausentes. Por favor, faça login novamente.');
            setLoading(false);
            router.push('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:1337/api/wiki-articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    data: {
                        title,
                        summary,
                        content, // Envia o conteúdo HTML do editor
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Credenciais inválidas ou permissão negada. Verifique seu login e permissões no Strapi.');
                }
                throw new Error(errorData.error?.message || `Falha ao adicionar artigo: ${response.statusText}`);
            }

            setSuccess('Artigo adicionado com sucesso!');
            setTitle('');
            setSummary('');
            setContent('');
            router.push('/wiki');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido ao adicionar o artigo.');
            }
            console.error('Erro na submissão do artigo:', err);
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
        <SectionWrapper title="Adicionar Novo Artigo da Wiki" titleColor="var(--color-funev-blue)">
            <button
                onClick={() => router.push('/wiki')}
                className="mb-6 px-6 py-3 rounded-md shadow-md transition duration-300"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
            >
                &larr; Voltar para Wiki
            </button>

            <div className="mx-auto p-6 bg-white rounded-lg shadow-md"
                 style={{ backgroundColor: 'var(--color-funev-light)', border: '1px solid var(--color-funev-green)' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Resumo:
                        </label>
                        <textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-funev-blue focus:border-funev-blue sm:text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700"
                               style={{ color: 'var(--color-funev-dark)' }}>
                            Conteúdo:
                        </label>
                        {/* Renderiza o CKEditor */}
                        <CKEditor
                            data={content}
                            onChange={(event: any, editor: any) => {
                                const data = editor.getData();
                                setContent(data);
                            }}
                            config={{
                                extraPlugins: [MyCustomUploadAdapterPlugin], // Adiciona o plugin de upload customizado
                                // Você pode adicionar mais configurações aqui, como toolbar, etc.
                            }}
                        />
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
                        {loading ? 'Adicionando...' : 'Adicionar Artigo'}
                    </button>
                </form>
            </div>
        </SectionWrapper>
    );
}