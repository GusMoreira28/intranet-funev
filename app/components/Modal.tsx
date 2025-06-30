// app/components/Modal.tsx
'use client';

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
            <div className="modal-content" style={{ backgroundColor: 'var(--color-funev-white)' }} onClick={e => e.stopPropagation()}>
                <span className="close-button" style={{ color: 'var(--color-funev-dark)' }} onClick={onClose}>&times;</span>
                <h2 id="modalTitle" className="text-2xl font-semibold" style={{ color: 'var(--color-funev-blue)' }}>{title}</h2>
                <div id="modalContent" className="text-left" style={{ color: 'var(--color-funev-dark)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;