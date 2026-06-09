import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, QrCode, ArrowRight } from "lucide-react";

const popularTables = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6">
          <UtensilsCrossed className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">
          Cafe Cookies
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">
          Delicious food, great vibes, and memories with friends
        </p>

        <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="h-6 w-6 text-primary" />
            <h2 className="font-semibold text-foreground">Scan QR at your table</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Each table has a unique QR code. Scan it to start ordering directly from your phone.
          </p>
          
          <div className="h-px bg-border mb-6" />
          
          <h3 className="font-medium text-foreground mb-3">
            Or select your table number:
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {popularTables.map((table) => (
              <Link key={table} href={`/table/${table}`}>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  {table}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm">
          <Link href="/table/1">
            <Button className="w-full h-12 gap-2 text-base">
              View Demo Menu
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Powered by Digital Dining
        </p>
      </div>
    </main>
  );
}
