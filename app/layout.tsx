import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-app",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakarta.variable}>
      <body suppressHydrationWarning className="font-app">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
