// app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Importa a fonte Inter
// CORRIGIDO O CAMINHO: Agora é relativo à pasta 'app', então './styles/globals.css'
import './globals.css';
import Header from './components/Header'; // Caminho correto: dentro de app/components/

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Intranet FUNEV',
  description: 'Intranet da Fundação Educativa Evangélica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body>
        <Header />
        <main className="container mx-auto p-6 mt-8">
            {children}
        </main>
        <footer className="bg-funevBlue p-6 text-funevWhite text-center text-sm rounded-t-lg mt-8">
            <p>&copy; {new Date().getFullYear()} Intranet FUNEV. Todos os direitos reservados.</p>
        </footer>
      </body>
    </html>
  );
}