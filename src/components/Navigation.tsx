interface NavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

/**
 * Legacy Navigation component retained for backwards compatibility.
 *
 * The unified AppShell handles layout navigation, so this component renders
 * nothing while keeping existing imports intact during the transition.
 */
export const Navigation = (_props: NavigationProps) => null;

export default Navigation;
