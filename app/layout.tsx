import type { Metadata } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { getLocale } from "@/lib/i18n/locale";
import "./globals.css";

// The Figma design sets every text layer in Montserrat; 400/500/700 cover the weights used.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

// The footer copyright is set in Montserrat Alternates in the design (I662:14447;342:1413).
const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alternates",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
});

// The source design uses the unavailable proprietary face "Digital Numbers". DSEG7 Classic is
// the spec-approved LCD equivalent and ships under OFL-1.1; next/font emits only this 5 KB WOFF2.
const digitalNumbers = localFont({
  src: "../node_modules/dseg/fonts/DSEG7-Classic/DSEG7Classic-Regular.woff2",
  variable: "--font-digital-numbers",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
  description: "SAA 2025 — Root Further",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${montserratAlternates.variable} ${digitalNumbers.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
