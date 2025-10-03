import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

export const useCustomerSession = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerKnown, setIsCustomerKnown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state

  useEffect(() => {
    try {
      const savedCustomer = localStorage.getItem('customer');
      if (savedCustomer) {
        setCustomer(JSON.parse(savedCustomer));
        setIsCustomerKnown(true);
      } else {
        // Only show the modal if no customer is saved
        setShowLoginModal(true);
      }
    } catch (error) { 
      console.error("Failed to parse customer from localStorage", error);
      // If parsing fails, treat as a new user
      setShowLoginModal(true);
    }
    setIsLoading(false);
  }, []);

  const login = (customerData: Customer) => {
    localStorage.setItem('customer', JSON.stringify(customerData));
    setCustomer(customerData);
    setIsCustomerKnown(true);
    setShowLoginModal(false);
  };

  const logout = () => {
    localStorage.removeItem('customer');
    setCustomer(null);
    setIsCustomerKnown(false);
    // You might want to reload or redirect here, or simply show the login modal again
    setShowLoginModal(true);
  };

  return { customer, isCustomerKnown, showLoginModal, login, logout, isLoading };
};
