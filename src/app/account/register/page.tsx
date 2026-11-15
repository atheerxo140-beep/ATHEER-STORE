import React from 'react';
import { CustomerAuthForm } from '@/components/CustomerAuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل حساب جديد | دار أثير — كارت الولاء والمكافآت',
  description: 'سجل برقم هاتفك لتفعيل كارت الولاء واستلام مكافآت دار أثير الحصرية.',
};

export default function AccountRegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <CustomerAuthForm initialMode="register" />
    </React.Suspense>
  );
}
