import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomerSession } from '@/hooks/useCustomerSession';
import { LoginOrSignupModal } from '@/components/customer/modals/LoginOrSignupModal';
import { SpinnerCircle as Spinner } from '@/components/Spinner';

interface Customer {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

interface CustomerSessionContextType {
  customer: Customer | null;
  isCustomerKnown: boolean;
  logout: () => void;
}

const CustomerSessionContext = createContext<CustomerSessionContextType | undefined>(undefined);

export const CustomerSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { customer, isCustomerKnown, showLoginModal, login, logout, isLoading } = useCustomerSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const handleModalClose = () => {
    // For now, we don't allow closing the modal without logging in.
    // This can be changed based on product requirements.
  };

  return (
    <CustomerSessionContext.Provider value={{ customer, isCustomerKnown, logout }}>
      {isCustomerKnown ? (
        children
      ) : (
        <LoginOrSignupModal 
          isOpen={showLoginModal} 
          onClose={handleModalClose} 
          onSuccess={login} 
        />
      )}
      {/* Render children even if modal is shown so the page is visible behind it */}
      <div style={{ display: isCustomerKnown ? 'block' : 'none' }}>
        {children}
      </div>
       {/* This div is a trick to show the modal overlaying the content. 
           A better implementation would use a Portal if not already handled by the Modal component. */}
       <div style={{ display: !isCustomerKnown ? 'block' : 'none'}} className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
         {children}
       </div>
    </CustomerSessionContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerSessionContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerSessionProvider');
  }
  return context;
};
