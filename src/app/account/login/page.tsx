import React from 'react';
import { CustomerAuthForm } from '@/components/CustomerAuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول وبوابة الحساب | دار أثير — ستريتوير مصري فاخر',
  description: 'سجل دخولك برقم هاتفك أو بريدك لمتابعة طلباتك ورصيد كارت الولاء في دار أثير.',
};

export default function CustomerLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <CustomerAuthForm initialMode="login" />
    </React.Suspense>
  );
}
