import { createContext, useContext, useState } from "react";

export type CheckoutAddress = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  deliveryNotes: string;
};

interface CheckoutState {
  selectedAddress: CheckoutAddress | null;
  isAddingNewAddress: boolean;
}

type CheckoutContextValue = {
  state: CheckoutState;
  selectAddress: (address: CheckoutAddress) => void;
  clearAddress: () => void;
  setIsAddingNewAddress: (isAdding: boolean) => void;
  addNewAddress: (address: CheckoutAddress) => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>({
    selectedAddress: null,
    isAddingNewAddress: false,
  });

  const selectAddress = (address: CheckoutAddress) => {
    setState((current) => ({
      ...current,
      selectedAddress: address,
      isAddingNewAddress: false,
    }));
  };

  const clearAddress = () => {
    setState((current) => ({
      ...current,
      selectedAddress: null,
    }));
  };

  const setIsAddingNewAddress = (isAdding: boolean) => {
    setState((current) => ({
      ...current,
      isAddingNewAddress: isAdding,
    }));
  };

  const addNewAddress = (address: CheckoutAddress) => {
    setState((current) => ({
      ...current,
      selectedAddress: address,
      isAddingNewAddress: false,
    }));
  };

  return (
    <CheckoutContext.Provider value={{ state, selectAddress, clearAddress, setIsAddingNewAddress, addNewAddress }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
