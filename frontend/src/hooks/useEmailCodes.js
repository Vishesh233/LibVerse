import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { IS_DEMO_BUILD } from '../utils/siteConfig';

// Asked once per page load (like useDemoMode); a failed answer is asked again next time
let emailStatus = null;

const loadEmailStatus = () => {
  if (!emailStatus) {
    emailStatus = authAPI.getEmailStatus()
      .then((r) => Boolean(r.data?.enabled))
      .catch(() => {
        emailStatus = null;
        return false;
      });
  }
  return emailStatus;
};

/**
 * Whether the server can email codes (sign-in codes, sign-up verification, forgot password).
 * Always false on a demo build.
 * @returns {boolean | null} null until the server has answered
 */
export const useEmailCodes = () => {
  const [enabled, setEnabled] = useState(IS_DEMO_BUILD ? false : null);
  useEffect(() => {
    if (IS_DEMO_BUILD) return undefined;
    let active = true;
    loadEmailStatus().then((value) => { if (active) setEnabled(value); });
    return () => { active = false; };
  }, []);
  return enabled;
};
