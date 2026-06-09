"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { MenuItem, AddOn } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

interface ItemCustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, addOns: AddOn[]) => void;
}

export function ItemCustomizationModal({ item, onClose, onAddToCart }: ItemCustomizationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddon, setSelectedAddon] = useState<AddOn | null>(null);

  const addons: AddOn[] = [
    { name: "Extra Choco Chips", price: 20 },
    { name: "Vanilla Ice Cream Scoop", price: 50 },
  ];

  const selectedAddonPrice = selectedAddon?.price || 0;
  const livePrice = (item.price + selectedAddonPrice) * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, selectedAddon ? [selectedAddon] : []);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl sm:rounded-2xl rounded-t-2xl flex flex-col h-auto max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div>
            <div className={`w-4 h-4 rounded-sm border ${(item as any).is_veg !== false ? 'border-green-600' : 'border-red-600'} flex items-center justify-center mb-1`}>
              <div className={`w-2 h-2 rounded-full ${(item as any).is_veg !== false ? 'bg-green-600' : 'bg-red-600'}`} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{item.name}</h2>
            <p className="text-sm font-semibold text-slate-600">₹{item.price}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 space-y-6 bg-slate-50">
          {/* Add-ons */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-800">Add Extras</h3>
              <span className="text-xs text-slate-500">Select up to 1</span>
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="addon" 
                    className="w-4 h-4 text-orange-600 accent-orange-600"
                    checked={selectedAddon === null}
                    onChange={() => setSelectedAddon(null)}
                  />
                  <span className="text-sm font-medium text-slate-700">No Add-on</span>
                </div>
                <span className="text-sm text-slate-500">₹0</span>
              </label>

              {addons.map((addon, index) => (
                <label key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="addon" 
                      className="w-4 h-4 text-orange-600 accent-orange-600"
                      checked={selectedAddon?.name === addon.name}
                      onChange={() => setSelectedAddon(addon)}
                    />
                    <span className="text-sm font-medium text-slate-700">{addon.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">+ ₹{addon.price}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-slate-800">Quantity</span>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-sm">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center bg-white rounded text-orange-600 font-bold hover:bg-orange-50 transition-colors"
              >
                -
              </button>
              <span className="font-bold w-4 text-center text-slate-800">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded text-orange-600 font-bold hover:bg-orange-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          <Button 
            onClick={handleAdd}
            className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-xl text-lg font-bold flex justify-between px-6 shadow-md shadow-orange-600/20"
          >
            <span className="flex flex-col items-start">
              <span className="text-xs font-medium text-orange-200">Total Price</span>
              <span>₹{livePrice}</span>
            </span>
            <span className="flex items-center gap-2">
              Add to Cart <span className="text-xl">→</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
