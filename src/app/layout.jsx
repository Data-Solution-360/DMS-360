import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { Inter, Poppins } from "next/font/google";
import AntdConfig from "../components/AntdConfig";
import ModalProvider from "../components/ModalProvider";
import { AppProviders } from "../context";
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
      <body className={`${inter.variable} ${poppins.variable}`}>
        <AntdConfig />
        <div id="modal-root">
          <AntdRegistry>
            <AppProviders>
              <ModalProvider>{children}</ModalProvider>
            </AppProviders>
          </AntdRegistry>
        </div>
      </body>
    </html>
  );
}
