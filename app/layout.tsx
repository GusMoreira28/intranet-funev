// app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Titillium_Web } from 'next/font/google';
import './globals.css';
import Header from './components/Header';

const titilliumWeb = Titillium_Web({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-titillium-web',
});

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
    <html lang="pt-BR" className={`${titilliumWeb.variable}`}>
      <body className='flex flex-col min-h-screen'>
        <Header />
        <main className="container mx-auto p-6 mt-8 flex-grow">
            {children}
        </main>
        <footer className="p-6 text-center text-sm mt-8"
                style={{ backgroundColor: 'var(--color-funev-blue)', color: 'var(--color-funev-white)' }}>
            <p>&copy; {new Date().getFullYear()} Intranet FUNEV. Todos os direitos reservados.</p>
        </footer>
      </body>
    </html>
  );
}