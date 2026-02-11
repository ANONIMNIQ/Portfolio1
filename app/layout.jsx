import "./globals.css";

export const metadata = {
  title: "WE BUILD WEB PAGES",
  description: "Минималистично портфолио за AI‑изработени сайтове.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
