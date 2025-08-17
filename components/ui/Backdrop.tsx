"use client";
import { ReactNode } from "react";

export function Backdrop({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-xl" onClick={(e)=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}