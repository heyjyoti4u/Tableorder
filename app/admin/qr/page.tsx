"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QRGeneratorPage() {
  // Default tables setup
  const [tables, setTables] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
  const [newTable, setNewTable] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Ye apne aap tumhari website ka live link utha lega
    setBaseUrl(window.location.origin);
  }, []);

  const handleAddTable = () => {
    if (newTable && !tables.includes(newTable)) {
      setTables([...tables, newTable]);
      setNewTable("");
    }
  };

  const handlePrint = () => {
    // Ye browser ka default print menu open kar dega
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-slate-50">
      
      {/* 🖨️ Header Section (Print karte waqt ye hide ho jayega) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 print:hidden gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">QR Code Generator</h1>
          <p className="text-slate-500 mt-1">Generate and print QR codes for your tables</p>
        </div>
        <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Printer className="w-4 h-4" />
          Print QR Codes
        </Button>
      </div>

      {/* ➕ Add Table Controls (Print karte waqt hide) */}
      <div className="flex gap-4 mb-8 print:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-100 max-w-md">
        <Input 
          placeholder="Enter Table No. (e.g., 7 or VIP-1)" 
          value={newTable}
          onChange={(e) => setNewTable(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTable()}
        />
        <Button onClick={handleAddTable} variant="secondary" className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* 📱 QR Codes Grid (Ye paper par print hoga) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 print:grid-cols-3 print:gap-6">
        {tables.map((table) => (
          <div 
            key={table} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative group print:shadow-none print:border-2 print:border-dashed print:border-slate-300"
          >
            {/* Delete Button (Sirf screen par dikhega) */}
            <button 
              onClick={() => setTables(tables.filter(t => t !== table))}
              className="absolute top-2 right-2 text-slate-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">
              Table {table}
            </h3>
            
            {/* Actual QR Code */}
            <div className="bg-white p-2 rounded-xl border-4 border-orange-100">
              <QRCodeSVG 
                value={`${baseUrl}/table/${table}`} 
                size={160}
                level="H" // Error correction high hai, thoda fatne par bhi scan hoga
                includeMargin={true}
              />
            </div>
            
            <p className="text-sm text-slate-500 mt-4 font-medium uppercase tracking-widest">
              Scan to order
            </p>
            <p className="text-sm text-orange-600 font-bold mt-1">
              Cafe Cookies
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}