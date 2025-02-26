import { createContext, useState, useContext, ReactNode } from 'react';
import { useCreateCurrency } from '@/utils/api/hooks';
import { useEditCurrency, useRemoveCurrency } from '@/utils/api/hooks/';
import { useQueryClient } from '@tanstack/react-query';

interface CurrencyContextType {
  selectedCurrency: Currency;
  isModalOpen: boolean;
  isLoading: boolean;
  openModal: (currency?: Currency) => void;
  closeModal: () => void;
  submitCurrencyForm: (params: Currency) => void;
  removeCurrency: (params: { _id: string }) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const queryClient = useQueryClient();

  const useMutateCreateCurrency = useCreateCurrency({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedCurrency(null);
        queryClient.invalidateQueries({ queryKey: ['currencies'] });
      }
    }
  });

  const useMutateEditCurrency = useEditCurrency({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedCurrency(null);
        queryClient.invalidateQueries({ queryKey: ['currencies'] });
      }
    }
  });

  const useMutateRemoveCurrency = useRemoveCurrency({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currencies'] });
      }
    }
  });

  const openModal = (currency) => {
    setIsModalOpen(true);
    if (currency) setSelectedCurrency(currency);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
    setSelectedCurrency(null);
  };

  const submitCurrencyForm = (params) => {
    setIsLoading(true);
    if (!selectedCurrency) {
      useMutateCreateCurrency.mutate(params);
    } else {
      useMutateEditCurrency.mutate({ ...params, _id: selectedCurrency._id });
    }
  };

  const removeCurrency = (params) => {
    useMutateRemoveCurrency.mutate(params);
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    isModalOpen,
    isLoading,
    openModal,
    closeModal,
    submitCurrencyForm,
    removeCurrency
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrencyContext = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext - CurrencyContext');
  }
  return context;
};
