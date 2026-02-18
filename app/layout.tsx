import type { Metadata } from "next";
import { Ubuntu, Merriweather } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const merriweather = Merriweather({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-serif",
});

const themeScript = `
(function(){
  var k='desk-booking-theme';
  var t=localStorage.getItem(k);
  if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);return;}
  if(window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.setAttribute('data-theme','light');
})();
`;

export const metadata: Metadata = {
  title: "Бронирование столов",
  description: "Бронирование рабочих столов на неделю вперёд",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${ubuntu.variable} ${merriweather.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
