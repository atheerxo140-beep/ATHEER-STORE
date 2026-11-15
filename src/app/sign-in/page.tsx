import React from 'react';
import { CustomerAuthForm } from '@/components/CustomerAuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | دار أثير — ستريتوير مصري فاخر',
  description: 'سجل دخولك برقم هاتفك أو بريدك لمتابعة شحناتك المباشرة ورصيد كارت الولاء في دار أثير.',
};

export default function SignInPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <CustomerAuthForm initialMode="login" />
    </React.Suspense>
  );
}
