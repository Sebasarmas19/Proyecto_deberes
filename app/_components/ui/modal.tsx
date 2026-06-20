"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#3c280f]/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 w-full max-w-[480px] rounded-[24px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-[20px] font-extrabold text-tinta">
            {title}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="flex size-[32px] items-center justify-center rounded-full bg-[#fcf9f5] text-[#b19a80] transition-colors hover:bg-[#f0e6d5] hover:text-tinta focus:outline-none focus-visible:ring-2 focus-visible:ring-terracota"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
