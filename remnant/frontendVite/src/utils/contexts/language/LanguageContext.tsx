import { createContext, useState, useContext, ReactNode } from 'react';
import { useCreateLanguage } from '@/utils/api/hooks';
import { useEditLanguage } from '@/utils/api/hooks/languages/useEditLanguage';
import { useRemoveLanguage } from '@/utils/api/hooks/languages/useRemoveLanguage';
import { useQueryClient } from '@tanstack/react-query';

interface LanguageContextType {
  selectedLanguage: Language;
  isModalOpen: boolean;
  isLoading: boolean;
  openModal: (language?: Language) => void;
  closeModal: () => void;
  submitLanguageForm: (params: Language) => void;
  removeLanguage: (params: { _id: string }) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const queryClient = useQueryClient();

  const useMutateCreateLanguage = useCreateLanguage({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedLanguage(null);
        queryClient.invalidateQueries({ queryKey: ['languages'] });
      }
    }
  });

  const useMutateEditLanguage = useEditLanguage({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedLanguage(null);
        queryClient.invalidateQueries({ queryKey: ['languages'] });
      }
    }
  });

  const useMutateRemoveLanguage = useRemoveLanguage({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['languages'] });
      }
    }
  });

  const openModal = (language) => {
    setIsModalOpen(true);
    if (language) setSelectedLanguage(language);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
    setSelectedLanguage(null);
  };

  const submitLanguageForm = (params) => {
    setIsLoading(true);
    if (!selectedLanguage) {
      useMutateCreateLanguage.mutate(params);
    } else {
      useMutateEditLanguage.mutate({ ...params, _id: selectedLanguage._id });
    }
  };

  const removeLanguage = (params) => {
    useMutateRemoveLanguage.mutate(params);
  };

  const value: LanguageContextType = {
    selectedLanguage,
    isModalOpen,
    isLoading,
    openModal,
    closeModal,
    submitLanguageForm,
    removeLanguage
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext - LanguageContext');
  }
  return context;
};
