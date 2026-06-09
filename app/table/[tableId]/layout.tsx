import { ReactNode } from "react";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { CartProvider } from "@/lib/cart-context";
import { GeofenceGuard } from "@/components/geofence-guard"; 

interface TableLayoutProps {
  children: ReactNode;
  params: Promise<{ tableId: string }>;
}

export default async function TableLayout({
  children,
  params,
}: TableLayoutProps) {
  
  // Params ko await karna zaroori hai Next.js 15 ke naye rules ke hisaab se
  const { tableId } = await params;

  return (
    <CartProvider>
      <GeofenceGuard>
        <div className="min-h-screen bg-background text-foreground">
          <Header tableId={tableId} />
          <main className="max-w-md mx-auto pb-20">{children}</main>
          <BottomNav tableId={tableId} />
        </div>
      </GeofenceGuard>
    </CartProvider>
  );
}