import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeModeProvider } from '@/context/ThemeModeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { getThemeConfig, generateThemeCss } from '@/lib/themeService';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export const metadata: Metadata = {
  title: 'ATHEER | أثير — Premium Egyptian Streetwear · 500 GSM Heavyweight Drops',
  description: 'The defining premium youth streetwear brand in Egypt. 500 GSM French terry cotton, signature boxy drop-shoulder hoodies, and stylish sweatshirts with cash on delivery and open box inspection.',
  keywords: 'ATHEER, أثير, هوديز ثقيل, سويت شيرت, 500 GSM, Streetwear Egypt, Cash on Delivery, Cairo, Alexandria',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F6F0' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = getThemeConfig();
  const themeStyles = generateThemeCss(theme);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <style id="atheer-theme-vars" dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedMode = localStorage.getItem('atheer_theme_mode');
                if (savedMode === 'light') {
                  document.documentElement.classList.add('theme-light');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.remove('theme-light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e){}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-brand-black text-brand-ivory antialiased overflow-x-hidden selection:bg-brand-gold selection:text-brand-black">
        <ThemeModeProvider>
          <LanguageProvider>
            <CustomerAuthProvider>
              <CartProvider>
                <WishlistProvider>
                  {children}
                  <MobileBottomNav />
                </WishlistProvider>
              </CartProvider>
            </CustomerAuthProvider>
          </LanguageProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
