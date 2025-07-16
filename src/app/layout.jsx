import Providers from "../components/Providers";
import "./globals.css";

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
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
