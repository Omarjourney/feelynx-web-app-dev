import { PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

export function ToastProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster />
      <Sonner richColors closeButton position="top-right" />
    </>
  );
}

export default ToastProvider;
