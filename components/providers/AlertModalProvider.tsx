"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type AlertType = "success" | "error";

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  message: string;
  title?: string;
}

interface AlertContextType {
  showAlert: (type: AlertType, message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertModalProvider");
  }
  return context;
};

export const AlertModalProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const showAlert = (type: AlertType, message: string, title?: string) => {
    setAlertState({ isOpen: true, type, message, title });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alertState.isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {alertState.type === "success" ? (
                  <CheckCircle2 className="w-6 h-6 text-[#16a34a]" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#dc2626]" />
                )}
                <h3 className="font-bold text-lg text-gray-800">
                  {alertState.title || (alertState.type === "success" ? "Success" : "Error")}
                </h3>
              </div>
              <button
                onClick={closeAlert}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-8 text-center">
              <p className="text-gray-600 text-base">{alertState.message}</p>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
              <button
                onClick={closeAlert}
                className={`px-8 py-2 rounded-md text-white font-medium transition-colors ${
                  alertState.type === "success"
                    ? "bg-[#16a34a] hover:bg-[#15803d]"
                    : "bg-[#dc2626] hover:bg-[#b91c1c]"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
