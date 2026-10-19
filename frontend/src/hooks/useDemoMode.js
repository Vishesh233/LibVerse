import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

// Asked once per page load: the answer never changes while the app runs
let demoStatus = null;

const loadDemoStatus = () => {
  if (!demoStatus) {
    demoStatus = authAPI.getDemoStatus()
      .then((r) => Boolean(r.data?.enabled))
      .catch(() => {
        demoStatus = null; // ask again next time (the server may still be waking up)
        return false;
      });
  }
  return demoStatus;
};

/**
 * Whether this is the live demo instance (the server runs with DEMO_MODE=true).
 * @returns {boolean | null} null until the server has answered
 */
export const useDemoMode = () => {
  const [enabled, setEnabled] = useState(null);
  useEffect(() => {
    let active = true;
    loadDemoStatus().then((value) => { if (active) setEnabled(value); });
    return () => { active = false; };
  }, []);
  return enabled;
};
