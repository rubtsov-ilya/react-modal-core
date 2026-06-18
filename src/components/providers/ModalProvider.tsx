'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface ModalContextProps {
  openModals: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  // Aliases based on user requirements
  modalOpen: (id: string) => void;
  modalClose: (id: string) => void;
}

const ModalContext = createContext<ModalContextProps | null>(null);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const openModal = useCallback((id: string) => {
    setOpenModals((prev) => ({ ...prev, [id]: true }));
  }, []);

  const closeModal = useCallback((id: string) => {
    setOpenModals((prev) => ({ ...prev, [id]: false }));
  }, []);

  const toggleModal = useCallback((id: string) => {
    setOpenModals((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isModalOpen = useCallback((id: string) => {
    return !!openModals[id];
  }, [openModals]);

  const value = useMemo<ModalContextProps>(() => ({
    openModals,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    modalOpen: openModal,
    modalClose: closeModal,
  }), [openModals, openModal, closeModal, toggleModal, isModalOpen]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  return useContext(ModalContext);
};
