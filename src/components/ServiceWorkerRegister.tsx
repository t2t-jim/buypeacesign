"use client";

import { useEffect } from "react";

/** Registers /sw.js once on the client (manual PWA — no next-pwa). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* silent — SW optional in local http without localhost quirks */
    });
  }, []);
  return null;
}

export default ServiceWorkerRegister;
