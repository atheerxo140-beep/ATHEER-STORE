import React from 'react';
import { CustomerAuthForm } from '@/components/CustomerAuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد | دار أثير — ستريتوير مصري فاخر',
  description: 'سجل حسابك برقم الهاتف واستلم كارت الولاء الذهبي و١٠٠ ج.م كاش هدية فورية مع أختام ترحيبية وتتبع شحناتك في مصر.',
};

export default function SignUpPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <CustomerAuthForm initialMode="register" />
    </React.Suspense>
  );
}
