import { createContext, useState, useContext, ReactNode } from 'react';
import { useEditProduct, useRemoveProduct, useCreateProduct } from '@/api/hooks/';
import { useQueryClient } from '@tanstack/react-query';

interface ProductContextType {
  selectedProduct: Product;
  isModalOpen: boolean;
  isLoading: boolean;
  openModal: (product?: Product) => void;
  closeModal: () => void;
  submitProductForm: (params: Product) => void;
  removeProduct: (params: { _id: string }) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const queryClient = useQueryClient();

  const useMutateCreateProduct = useCreateProduct({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedProduct(null);
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }
  });

  const useMutateEditProduct = useEditProduct({
    options: {
      onSuccess: () => {
        setIsModalOpen(false);
        setIsLoading(false);
        setSelectedProduct(null);
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }
  });

  const useMutateRemoveProduct = useRemoveProduct({
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }
  });

  const openModal = (product) => {
    setIsModalOpen(true);
    if (product) setSelectedProduct(product);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
    setSelectedProduct(null);
  };

  const submitProductForm = (params) => {
    setIsLoading(true);
    if (!selectedProduct) {
      useMutateCreateProduct.mutate(params);
    } else {
      useMutateEditProduct.mutate({ ...params, _id: selectedProduct._id });
    }
  };

  const removeProduct = (params) => {
    useMutateRemoveProduct.mutate(params);
  };

  const value: ProductContextType = {
    selectedProduct,
    isModalOpen,
    isLoading,
    openModal,
    closeModal,
    submitProductForm,
    removeProduct
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext - ProductContext');
  }
  return context;
};
