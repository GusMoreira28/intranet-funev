// app/components/PdfCanvasViewer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
// npm install pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

// Aponta o worker do pdf.js para o arquivo servido via CDN (ou copie para /public e aponte localmente)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfCanvasViewerProps {
    url: string;
    title?: string;
}

const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({ url, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState<number>(1.2);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Carrega o documento PDF
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        const loadingTask = pdfjsLib.getDocument({ url });
        loadingTask.promise
            .then((doc) => {
                if (cancelled) return;
                setPdfDoc(doc);
                setNumPages(doc.numPages);
                setCurrentPage(1);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Erro ao carregar PDF:', err);
                setError('Não foi possível carregar o documento PDF.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            loadingTask.destroy();
        };
    }, [url]);

    // Renderiza a página atual no canvas sempre que mudar página, escala ou documento
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        let renderTask: pdfjsLib.RenderTask | null = null;
        let cancelled = false;

        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(currentPage);
                if (cancelled) return;

                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                renderTask = page.render({
                    canvas,
                    canvasContext: context,
                    viewport,
                });

                await renderTask.promise;
            } catch (err) {
                if ((err as any)?.name !== 'RenderingCancelledException') {
                    console.error('Erro ao renderizar página do PDF:', err);
                }
            }
        };

        renderPage();

        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [pdfDoc, currentPage, scale]);

    const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
    const goToNextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));
    const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)));
    const zoomOut = () => setScale((s) => Math.max(0.4, +(s - 0.2).toFixed(2)));

    if (error) {
        return (
            <div className="w-full p-6 text-center rounded-lg border" style={{ color: 'red' }}>
                {error}
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Barra de controles */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 rounded-md shadow-sm disabled:opacity-40"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    >
                        &larr; Anterior
                    </button>
                    <span style={{ color: 'var(--color-funev-dark)' }}>
                        Página {currentPage} de {numPages || '...'}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage >= numPages}
                        className="px-3 py-1.5 rounded-md shadow-sm disabled:opacity-40"
                        style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                    >
                        Próxima &rarr;
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        className="px-3 py-1.5 rounded-md shadow-sm"
                        style={{ backgroundColor: 'var(--color-funev-gray)', color: 'var(--color-funev-white)' }}
                    >
                        -
                    </button>
                    <span style={{ color: 'var(--color-funev-dark)' }}>{Math.round(scale * 100)}%</span>
                    <button
                        onClick={zoomIn}
                        className="px-3 py-1.5 rounded-md shadow-sm"
                        style={{ backgroundColor: 'var(--color-funev-gray)', color: 'var(--color-funev-white)' }}
                    >
                        +
                    </button>
                </div>

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-md shadow-sm"
                    style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}
                >
                    Abrir em nova aba
                </a>
            </div>

            {/* Área de renderização */}
            <div
                ref={containerRef}
                className="w-full overflow-auto rounded-lg border shadow-md flex justify-center bg-gray-100"
                style={{ maxHeight: '800px' }}
            >
                {loading && (
                    <p className="p-6 text-center" style={{ color: 'var(--color-funev-dark)' }}>
                        Carregando {title || 'documento'}...
                    </p>
                )}
                <canvas ref={canvasRef} className={loading ? 'hidden' : ''} />
            </div>
        </div>
    );
};

export default PdfCanvasViewer;