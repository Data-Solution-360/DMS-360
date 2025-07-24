import { Inter, Poppins } from "next/font/google";
import RouteGuard from "../components/auth/RouteGuard";
import Providers from "../components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "DMS-360 - Document Management System",
  description:
    "A comprehensive document management system with Cloud integration",
  keywords: ["document management", "file storage", "Cloud", "dms"],
  authors: [{ name: "DMS-360 Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <RouteGuard>{children}</RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
