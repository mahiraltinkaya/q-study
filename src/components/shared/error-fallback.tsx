"use client";

import { Button } from "@/components/ui/button";

const SUPPORT_PHONE = "0 850 222 0 860";
const SUPPORT_PHONE_HREF = "tel:+908502220860";

function UnexpectedStateIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      fill="none"
      className="size-12 text-orange-500"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M24 8 A16 16 0 0 1 37.86 32"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="0.5 6"
      />
      <path d="M24 8 A16 16 0 1 0 37.86 32" stroke="currentColor" strokeWidth="3.25" />
      <path d="M19.8 4.2 L24.6 8 L19.8 11.8" stroke="currentColor" strokeWidth="3.25" />
      <circle cx="17.5" cy="25" r="1.9" fill="currentColor" />
      <circle cx="24" cy="25" r="1.9" fill="currentColor" />
      <circle cx="30.5" cy="25" r="1.9" fill="currentColor" />
    </svg>
  );
}

export interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border border-zinc-100 bg-white px-8 py-12 text-center"
    >
      <UnexpectedStateIcon />

      <h2 className="text-prose-ink text-base font-semibold">
        Beklenmeyen bir durumla karşılaştık, üzgünüz.
      </h2>

      <p className="text-prose-ink max-w-2xl text-sm leading-8">
        Size yardımcı olabilmemiz için{" "}
        <a href={SUPPORT_PHONE_HREF} className="font-semibold hover:underline">
          {SUPPORT_PHONE}
        </a>{" "}
        numaralı <span className="font-semibold">QNB Sigorta Çağrı Merkezimiz</span> ile iletişime
        geçebilirsiniz. Sağlığınız bizim için önemli, desteğe her zaman hazırız.
      </p>

      {onRetry ? (
        <Button
          type="button"
          variant="brand"
          size="xl"
          shape="pill"
          onClick={onRetry}
          className="text-xs font-semibold tracking-wide uppercase"
        >
          Tekrar Deneyin
        </Button>
      ) : null}

      {process.env.NODE_ENV === "development" && error.message ? (
        <pre className="w-full overflow-x-auto rounded-lg bg-zinc-50 p-3 text-left font-mono text-xs text-zinc-600">
          {error.message}
        </pre>
      ) : null}
    </div>
  );
}

export { ErrorFallback };
