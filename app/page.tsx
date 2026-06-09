import { ChefHat, QrCode } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Logo Section */}
      <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-600/20">
        <ChefHat className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-4xl font-black text-slate-900 mb-2">Cafe Cookies</h1>
      <p className="text-slate-500 mb-10 text-center max-w-sm font-medium">
        Delicious food, great vibes, and memories with friends.
      </p>

      {/* QR Instruction Box */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
        
        <div className="bg-orange-50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 border border-orange-100">
          <QrCode className="w-10 h-10 text-orange-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Ready to Order?</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          Please scan the QR code placed on your table using your phone's camera. You'll be able to view our digital menu and place your order directly!
        </p>
      </div>

      {/* Hidden Admin Link (For your convenience) */}
      <Link 
        href="/admin/dashboard" 
        className="mt-12 text-xs font-semibold text-slate-400 hover:text-orange-500 transition-colors"
      >
        Admin Login
      </Link>
    </div>
  );
}
