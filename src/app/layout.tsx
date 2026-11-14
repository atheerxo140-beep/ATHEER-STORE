import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { getThemeConfig } from '@/lib/themeService';

export const metadata: Metadata = {
  title: 'ATHEER | أثير — Premium Egyptian Streetwear · 500 GSM Heavyweight Drops',
  description: 'The defining premium youth streetwear brand in Egypt. 500 GSM French terry cotton, signature boxy drop-shoulder hoodies, and stylish sweatshirts with cash on delivery and open box inspection.',
  keywords: 'ATHEER, أثير, هوديز ثقيل, سويت شيرت, 500 GSM, Streetwear Egypt, Cash on Delivery, Cairo, Alexandria',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = getThemeConfig();
  const themeStyles = `
    :root {
      --brand-gold: ${theme.brandGold || '#C5A880'};
      --brand-black: ${theme.brandBlack || '#0A0A0A'};
      --brand-charcoal: ${theme.brandCharcoal || '#141414'};
    }
  `;

  return (
    <html lang="ar" dir="rtl">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body className="min-h-screen bg-brand-black text-brand-ivory antialiased">
        <LanguageProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </CustomerAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
