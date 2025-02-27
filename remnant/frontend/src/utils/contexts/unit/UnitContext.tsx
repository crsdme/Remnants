import { createContext, useState, useContext, ReactNode } from 'react';
import { useEditUnit, useRemoveUnit, useCreateUnit } from '@/api/hooks/';
import { useQueryClient } from '@tanstack/react-query';

interface UnitContextType {
  selectedUnit: Unit;
  isModalOpen: boolean;
  isLoading: boolean;
  openModal: (item?: Unit) => void;
  closeModal: () => void;
  submitUnitForm: (params: Unit) => void;
  removeUnit: (params: { _id: string }) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

interface UnitProviderProps {
  children: ReactNode;
}

export const UnitProvider = ({ children }: UnitProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const queryClient = useQueryClient();

  const useMutateCreateUnit = useCreateUnit({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedUnit(null);
        queryClient.invalidateQueries({ queryKey: ['units'] });
      }
    }
  });

  const useMutateEditUnit = useEditUnit({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedUnit(null);
        queryClient.invalidateQueries({ queryKey: ['units'] });
      }
    }
  });

  const useMutateRemoveUnit = useRemoveUnit({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['units'] });
      }
    }
  });

  const openModal = (unit) => {
    setIsModalOpen(true);
    if (unit) setSelectedUnit(unit);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
    setSelectedUnit(null);
  };

  const submitUnitForm = (params) => {
    setIsLoading(true);
    if (!selectedUnit) {
      useMutateCreateUnit.mutate(params);
    } else {
      useMutateEditUnit.mutate({ ...params, _id: selectedUnit._id });
    }
  };

  const removeUnit = (params) => {
    useMutateRemoveUnit.mutate(params);
  };

  const value: UnitContextType = {
    selectedUnit,
    isModalOpen,
    isLoading,
    openModal,
    closeModal,
    submitUnitForm,
    removeUnit
  };

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
};

export const useUnitContext = (): UnitContextType => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnitContext - UnitContext');
  }
  return context;
};
