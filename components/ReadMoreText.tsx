"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function ReadMoreText({ text, maxLength = 50 }: { text: string, maxLength?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <>
      <span>
        {text.slice(0, maxLength)}...{" "}
        <button onClick={() => setIsOpen(true)} className="text-primary hover:underline font-semibold ml-1 text-xs">
          Read More
        </button>
      </span>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl p-8 max-w-lg w-full relative z-10 animate-in zoom-in-95 fade-in duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted text-muted-foreground rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Message Details</h3>
            <div className="text-muted-foreground text-sm leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
              {text}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
