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
import { buildStrapiUrl, API_CONFIG } from '@/app/config/api';

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

    // Configuração do Plugin de Upload de Imagem para o CKEditor - VERSÃO MELHORADA
    class MyCustomUploadAdapter {
        private loader: any;
        
        constructor(loader: any) {
            this.loader = loader;
        }

        upload(): Promise<{ default: string }> {
            return this.loader.file
                .then((file: File) => new Promise<{ default: string }>((resolve, reject) => {
                    // Validação do arquivo
                    if (!file) {
                        reject(new Error('Nenhum arquivo selecionado'));
                        return;
                    }

                    // Validação do tipo de arquivo
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                    if (!allowedTypes.includes(file.type)) {
                        reject(new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.'));
                        return;
                    }

                    // Validação do tamanho (exemplo: máximo 5MB)
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (file.size > maxSize) {
                        reject(new Error('Arquivo muito grande. Tamanho máximo: 5MB.'));
                        return;
                    }

                    const formData = new FormData();
                    formData.append('files', file);

                    const token = getToken();
                    if (!token) {
                        console.error('MyCustomUploadAdapter: Token de autenticação ausente.');
                        reject(new Error('Token de autenticação ausente para upload.'));
                        return;
                    }

                    console.log('MyCustomUploadAdapter: Iniciando upload...', {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type
                    });

                    fetch(buildStrapiUrl('/upload'), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData,
                    })
                    .then(response => {
                        console.log('MyCustomUploadAdapter: Status da resposta:', response.status);
                        
                        if (!response.ok) {
                            return response.text().then(text => {
                                console.error('MyCustomUploadAdapter: Erro na resposta:', text);
                                throw new Error(`Falha no upload: ${response.status} - ${text.substring(0, 100)}`);
                            });
                        }
                        
                        return response.json();
                    })
                    .then(data => {
                        console.log('MyCustomUploadAdapter: Dados recebidos completos:', JSON.stringify(data, null, 2));
                        
                        if (data && Array.isArray(data) && data.length > 0 && data[0]) {
                            const fileData = data[0];
                            console.log('MyCustomUploadAdapter: Dados do arquivo:', fileData);
                            
                            // Tenta diferentes propriedades da resposta do Strapi
                            let imageUrl = '';
                            
                            if (fileData.url) {
                                imageUrl = `${API_CONFIG.strapi}${fileData.url}`;
                            } else if (fileData.formats && fileData.formats.small) {
                                imageUrl = buildStrapiUrl(fileData.formats.small.url);
                            } else if (fileData.formats && fileData.formats.thumbnail) {
                                imageUrl = buildStrapiUrl(fileData.formats.thumbnail.url);
                            } else {
                                console.error('MyCustomUploadAdapter: URL não encontrada nos dados:', fileData);
                                reject(new Error('URL da imagem não encontrada na resposta do servidor.'));
                                return;
                            }
                            
                            console.log('MyCustomUploadAdapter: URL final da imagem:', imageUrl);
                            
                            // Testa se a URL é acessível
                            const testImage = new Image();
                            testImage.onload = () => {
                                console.log('MyCustomUploadAdapter: Imagem carregada com sucesso!');
                                resolve({
                                    default: imageUrl
                                });
                            };
                            testImage.onerror = () => {
                                console.error('MyCustomUploadAdapter: Falha ao carregar imagem da URL:', imageUrl);
                                reject(new Error(`Não foi possível carregar a imagem da URL: ${imageUrl}`));
                            };
                            testImage.src = imageUrl;
                            
                        } else {
                            console.error('MyCustomUploadAdapter: Resposta inesperada do Strapi:', data);
                            reject(new Error('Resposta inesperada do servidor. Verifique se o upload foi configurado corretamente no Strapi.'));
                        }
                    })
                    .catch(error => {
                        console.error('MyCustomUploadAdapter: Erro no upload:', error);
                        reject(error);
                    });
                }));
        }

        abort() {
            // Implementar lógica de abortar upload se necessário
            console.log('MyCustomUploadAdapter: Upload abortado');
        }
    }

    // Plugin melhorado
    function MyCustomUploadAdapterPlugin(editor: any) {
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
            const response = await fetch(buildStrapiUrl('/wiki-articles'), {
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
                        {/* Renderiza o CKEditor com configuração completa */}
                        <CKEditor
                            data={content}
                            onChange={(event: any, editor: any) => {
                                const data = editor.getData();
                                setContent(data);
                            }}
                            config={{
                                // Plugins essenciais para imagem
                                extraPlugins: [MyCustomUploadAdapterPlugin],
                                
                                // Configuração da toolbar com botões de imagem
                                toolbar: {
                                    items: [
                                        'heading',
                                        '|',
                                        'bold',
                                        'italic',
                                        'link',
                                        'bulletedList',
                                        'numberedList',
                                        '|',
                                        'outdent',
                                        'indent',
                                        '|',
                                        'imageUpload', // Botão para upload de imagem
                                        'blockQuote',
                                        'insertTable',
                                        'mediaEmbed',
                                        'undo',
                                        'redo'
                                    ]
                                },
                                
                                // Configurações específicas para imagem
                                image: {
                                    toolbar: [
                                        'imageTextAlternative',
                                        'imageStyle:full',
                                        'imageStyle:side',
                                        '|',
                                        'linkImage'
                                    ],
                                    // Configurações adicionais para melhor compatibilidade
                                    styles: [
                                        'full',
                                        'side',
                                        'alignLeft',
                                        'alignCenter',
                                        'alignRight'
                                    ],
                                    resizeOptions: [
                                        {
                                            name: 'resizeImage:original',
                                            value: null,
                                            label: 'Original'
                                        },
                                        {
                                            name: 'resizeImage:50',
                                            value: '50',
                                            label: '50%'
                                        },
                                        {
                                            name: 'resizeImage:75',
                                            value: '75',
                                            label: '75%'
                                        }
                                    ]
                                },
                                
                                // Configuração da tabela (opcional)
                                table: {
                                    contentToolbar: [
                                        'tableColumn',
                                        'tableRow',
                                        'mergeTableCells'
                                    ]
                                },
                                
                                // Configuração de linguagem (opcional)
                                language: 'pt',
                                
                                // Configurações de parágrafo
                                heading: {
                                    options: [
                                        { model: 'paragraph', title: 'Parágrafo', class: 'ck-heading_paragraph' },
                                        { model: 'heading1', view: 'h1', title: 'Título 1', class: 'ck-heading_heading1' },
                                        { model: 'heading2', view: 'h2', title: 'Título 2', class: 'ck-heading_heading2' },
                                        { model: 'heading3', view: 'h3', title: 'Título 3', class: 'ck-heading_heading3' }
                                    ]
                                }
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