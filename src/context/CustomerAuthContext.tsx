'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerAddress {
  id: string;
  label: string; // e.g., 'المنزل / Home' or 'العمل / Work'
  recipientName: string;
  phone: string;
  governorate: string;
  city: string;
  streetAddress: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  deliveryNotes?: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  preferredLanguage?: 'ar' | 'en';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Black_Edition';
  addresses: CustomerAddress[];
  createdAt: string;
}

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; pass: string; fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<boolean>;
  addAddress: (addr: Omit<CustomerAddress, 'id'>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'atheer_customer_session';

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse customer session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCustomer = (prof: CustomerProfile | null) => {
    setCustomer(prof);
    try {
      if (prof) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prof));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save customer session', e);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.customer) {
        saveCustomer(data.customer);
        return { success: true };
      }
      return { success: false, error: data.error || 'فشل تسجيل الدخول' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; pass: string; fullName: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.customer) {
        saveCustomer(resData.customer);
        return { success: true };
      }
      return { success: false, error: resData.error || 'فشل إنشاء الحساب' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    saveCustomer(null);
  };

  const updateProfile = async (updates: Partial<CustomerProfile>) => {
    if (!customer) return false;
    const updated = { ...customer, ...updates };
    saveCustomer(updated);
    fetch('/api/auth/customer/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: customer.id, updates }),
    }).catch(() => {});
    return true;
  };

  const addAddress = async (addr: Omit<CustomerAddress, 'id'>) => {
    if (!customer) return false;
    const newAddress: CustomerAddress = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    const addresses = customer.addresses || [];
    if (newAddress.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    } else if (addresses.length === 0) {
      newAddress.isDefault = true;
    }
    const updated = { ...customer, addresses: [...addresses, newAddress] };
    saveCustomer(updated);
    return true;
  };

  const deleteAddress = async (id: string) => {
    if (!customer) return false;
    const filtered = (customer.addresses || []).filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    saveCustomer({ ...customer, addresses: filtered });
    return true;
  };

  const setDefaultAddress = async (id: string) => {
    if (!customer) return false;
    const updated = (customer.addresses || []).map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveCustomer({ ...customer, addresses: updated });
    return true;
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
