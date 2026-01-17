'use client';

import * as React from 'react';
import { Modal } from './Modal';

type ModalType = 'success' | 'error' | 'confirm' | 'info';

interface SystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void; // Only for 'confirm' type
    type: ModalType;
    title?: string;
    message: string;
}

export function SystemModal({ isOpen, onClose, onConfirm, type, title, message }: SystemModalProps) {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                );
            case 'confirm':
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                );
            default: // info
                return (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                );
        }
    };

    const getDefaultTitle = () => {
        if (title) return title;
        switch (type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'confirm': return 'Confirm Action';
            default: return 'Information';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getDefaultTitle()} width="max-w-sm">
            <div className="text-center">
                {getIcon()}
                <div className="mt-4">
                    <p className="text-sm text-gray-500 font-medium">
                        {message}
                    </p>
                </div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
                {type === 'confirm' ? (
                    <>
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-[var(--card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--foreground)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            onClick={() => {
                                if (onConfirm) onConfirm();
                                onClose();
                            }}
                        >
                            Confirm
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                        onClick={onClose}
                    >
                        OK
                    </button>
                )}
            </div>
        </Modal>
    );
}
