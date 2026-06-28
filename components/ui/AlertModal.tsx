import React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error";
}

export default function AlertModal({ isOpen, onClose, title, message, type }: AlertModalProps) {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 print:hidden">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-gray-600 font-medium">{message}</p>
        </div>

        <div className="p-4 bg-gray-50 flex justify-center border-t border-gray-100">
          <button 
            onClick={onClose}
            className={`px-8 py-2 text-white rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSuccess 
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" 
                : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
