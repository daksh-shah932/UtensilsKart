import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { CartProvider } from "@/lib/providers/CartProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata = {
  title: "UtensilKart — Kitchen Utensils & Cookware",
  description:
    "Shop premium kitchen utensils, cookware, and more. Best prices guaranteed.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-bg text-ink min-h-screen">
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
              <CartDrawer />
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{ duration: 4000 }}
              />
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
