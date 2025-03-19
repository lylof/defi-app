import { Outfit as FontSans } from "next/font/google";
import localFont from 'next/font/local';

/**
 * Configuration de la police principale (TT Firs Neue)
 * Avec fallback sur Outfit, une police similaire disponible gratuitement
 */

// Police de secours depuis Google Fonts (similaire à TT Firs Neue)
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

// Configuration pour TT Firs Neue (à décommenter quand les fichiers seront disponibles)
/*
export const ttFirsNeue = localFont({
  src: [
    {
      path: '../../../public/fonts/tt-firs-neue/TTFirsNeue-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/tt-firs-neue/TTFirsNeue-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/tt-firs-neue/TTFirsNeue-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/tt-firs-neue/TTFirsNeue-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-tt-firs',
  display: 'swap',
});
*/ 