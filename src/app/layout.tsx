import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/shared/query-provider";
import { WebVitals } from "@/components/shared/web-vitals";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const generateMetadata = (): Metadata => {
  return {
    title: "Dijital Satın Alma | QNB Sigorta",
    description:
      "Tamamlayıcı Sağlık Sigortası teklifinizi birkaç adımda oluşturun ve online satın alın.",
  };
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <WebVitals />
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
