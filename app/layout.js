import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Modal } from "@/components/Web3Modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Avocado Starter Project",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Modal>{children}</Web3Modal>
      </body>
    </html>
  );
}
