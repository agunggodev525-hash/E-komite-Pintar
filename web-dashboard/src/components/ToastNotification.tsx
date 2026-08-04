"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'LOADING' | 'INFO';

export interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose?: () => void;
  duration?: number;
}

export default function ToastNotification({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [render, setRender] = useState(isVisible);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setRender(true);
      // Jeda kecil agar DOM sempat ter-render sebelum memicu animasi slide-in
      setTimeout(() => setShow(true), 10);
      
      // Auto-close hanya jika bukan status LOADING
      if (type !== 'LOADING' && duration > 0) {
        const timer = setTimeout(() => {
          setShow(false);
          // Tunggu animasi slide-out selesai sebelum menghapus dari DOM
          setTimeout(() => {
            setRender(false);
            if (onClose) onClose();
          }, 300); 
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
      const timer = setTimeout(() => {
        setRender(false);
        if (onClose) onClose();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, duration, onClose]);

  if (!render) return null;

  let bgColor = 'bg-blue-500';
  let Icon = Info;
  let iconClass = '';

  switch (type) {
    case 'SUCCESS':
      bgColor = 'bg-emerald-500';
      Icon = CheckCircle2;
      break;
    case 'ERROR':
      bgColor = 'bg-red-500';
      Icon = XCircle;
      break;
    case 'LOADING':
      bgColor = 'bg-blue-500';
      Icon = Loader2;
      iconClass = 'animate-spin';
      break;
    case 'INFO':
      bgColor = 'bg-blue-500';
      Icon = Info;
      break;
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ease-out transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
      <div className={`${bgColor} text-white px-5 py-4 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] flex items-center gap-3 min-w-[320px] max-w-md border border-white/20 backdrop-blur-md`}>
        <Icon className={`w-6 h-6 shrink-0 ${iconClass}`} />
        <p className="font-semibold text-sm leading-snug">{message}</p>
      </div>
    </div>
  );
}
