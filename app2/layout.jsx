import "./globals.css";

export const metadata = {
  title: "WE BUILD WEB PAGES",
  description: "Минималистично портфолио за AI‑изработени сайтове.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
