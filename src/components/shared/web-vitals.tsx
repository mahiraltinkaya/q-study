"use client";

import { useReportWebVitals } from "next/web-vitals";

type WebVitalsMetric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

const ANALYTICS_URL = process.env.NEXT_PUBLIC_WEB_VITALS_URL;

function reportWebVitals(metric: WebVitalsMetric) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[web-vitals] ${metric.name}`, Math.round(metric.value), metric.rating);
    return;
  }

  if (!ANALYTICS_URL) return;

  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    path: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_URL, body);
  } else {
    void fetch(ANALYTICS_URL, { body, method: "POST", keepalive: true });
  }
}

function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}

export { WebVitals };
