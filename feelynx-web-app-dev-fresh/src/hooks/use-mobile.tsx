import * as React from 'react';

import { MOBILE_BREAKPOINT } from '@/lib/constants';

/**
 * Detects whether the viewport width is below the mobile breakpoint.
 *
 * The hook attaches a `matchMedia` listener to react to resize events and
 * removes the listener when the component unmounts to avoid leaking handlers.
 *
 * @returns `true` when the viewport is considered mobile, otherwise `false`.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // React to viewport changes so consumers receive up-to-date breakpoint info.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else {
      mql.addListener(onChange);
    }

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else {
        mql.removeListener(onChange);
      }
    };
  }, []);

  return !!isMobile;
}
