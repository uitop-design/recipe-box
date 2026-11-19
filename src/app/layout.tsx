import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe Box",
  description: "Personal recipe catalog with tags, search and serving scaling",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="logo">Recipe Box</a>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
