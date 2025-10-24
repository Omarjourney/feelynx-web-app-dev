import * as React from 'react';

export type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export const SidebarContext = React.createContext<SidebarContext | null>(null);

/**
 * Reads the sidebar context provided by `<SidebarProvider />`.
 *
 * The hook ensures a provider is present so consumers get descriptive runtime
 * errors instead of undefined behaviour.
 *
 * @returns The current sidebar state and helpers from the nearest provider.
 * @throws When used outside of a provider hierarchy.
 */
export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}
