// app/components/Modal.tsx
'use client'; // Necessário para componentes que usam estado e interatividade no App Router

import React from 'react';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, title, children }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <span className="close-button" onClick={onClose}>&times;</span>
                <h2 id="modalTitle" className="text-2xl font-semibold text-funevBlue mb-4">{title}</h2>
                <div id="modalContent" className="text-funevDark text-left">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;