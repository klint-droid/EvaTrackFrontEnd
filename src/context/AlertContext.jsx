import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertConfirmModal from '../components/AlertConfirmModal';

const AlertContext = createContext();

export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onClose: null,
    isLoading: false,
    showCancel: false,
  });

  const closeAlert = useCallback(() => {
    setModalState((prev) => {
      if (prev.onClose) prev.onClose();
      return { ...prev, isOpen: false, isLoading: false };
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!modalState.onConfirm) {
      closeAlert();
      return;
    }
    
    try {
      setModalState(prev => ({ ...prev, isLoading: true }));
      await modalState.onConfirm();
    } finally {
      closeAlert();
    }
  }, [modalState, closeAlert]);

  const showAlert = useCallback((message, title = 'Alert', type = 'info') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'OK',
      cancelText: null,
      onConfirm: closeAlert, // Add closeAlert to onConfirm so it closes
      onClose: closeAlert,
      isLoading: false,
    });
  }, [closeAlert]);

  const showConfirm = useCallback((message, onConfirm, title = 'Confirm', type = 'warning', confirmText = 'Confirm') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm,
      onClose: null,
      isLoading: false,
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, closeAlert }}>
      {children}
      <AlertConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={handleConfirm}
        onClose={closeAlert}
        isLoading={modalState.isLoading}
      />
    </AlertContext.Provider>
  );
};
