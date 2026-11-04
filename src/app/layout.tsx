import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'ATHEER | أثير — Premium Youth Streetwear · 500 GSM Heavyweight Hoodies',
  description: 'The defining youth streetwear brand in the Gulf. 500 GSM French terry cotton, signature boxy drop-shoulder hoodies, and stylish sweatshirts engineered for modern youth.',
  keywords: 'ATHEER, Streetwear, Hoodies, Sweatshirts, Youth Fashion, 500 GSM, Riyadh, Dubai, GCC, Cash on Delivery',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-brand-black text-brand-ivory antialiased">
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
