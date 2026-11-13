import React from "react";
import { deserializePaymentTerms } from "@/lib/payment-methods/serializer";
import { PAYMENT_PROVIDERS } from "@/lib/payment-methods/data";
import { PaymentProviderLogo } from "./payment-provider-logo";
import { Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PaymentMethodsDisplayProps {
  notes?: string | null;
  className?: string;
}

export function PaymentMethodsDisplay({
  notes,
  className = "",
}: PaymentMethodsDisplayProps) {
  const termsData = deserializePaymentTerms(notes);
  const { methods, paymentTermsDays, customNotes } = termsData;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Payment Deadline Badge */}
      <div className="flex items-center gap-2 text-xs font-semibold text-forest-900 dark:text-lime-300">
        <Clock className="w-3.5 h-3.5 text-forest-800 dark:text-lime-400 shrink-0" />
        <span>
          {paymentTermsDays === 0
            ? "Règlement au comptant à réception de la facture"
            : `Règlement exigible sous ${paymentTermsDays} jours`}
        </span>
      </div>

      {/* List of configured payment methods */}
      {methods && methods.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5">
          {methods.map((method) => {
            const provider = PAYMENT_PROVIDERS.find((p) => p.id === method.providerId);
            const providerName = provider?.name ?? method.providerId;
            const entries = Object.entries(method.details || {}).filter(
              ([, v]) => Boolean(v) && String(v).trim() !== ""
            );

            return (
              <div
                key={method.providerId}
                className="rounded-xl border border-line bg-surface p-2.5 sm:p-3 text-xs space-y-1.5 shadow-2xs"
              >
                {/* Method Title */}
                <div className="flex items-center gap-2">
                  <PaymentProviderLogo providerId={method.providerId} size={24} />
                  <span className="font-bold text-forest-950 dark:text-white">
                    {providerName}
                  </span>
                  <span className="text-[10px] text-ink-muted hidden sm:inline">
                    · {provider?.countryOrZone}
                  </span>
                </div>

                {/* Method Coordinates */}
                {entries.length > 0 && (
                  <div className="pl-8 space-y-0.5 text-[11px]">
                    {entries.map(([key, val]) => {
                      const fieldDef = provider?.fields.find((f) => f.key === key);
                      const label = fieldDef?.label || key;

                      return (
                        <div key={key} className="flex flex-wrap items-baseline gap-1">
                          <span className="text-ink-muted">{label} :</span>
                          <span className="font-mono font-semibold text-forest-950 dark:text-lime-300 select-all">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Custom instructions note */}
      {customNotes && customNotes.trim() !== "" && (
        <p className="text-[11px] text-ink-muted italic pl-1 leading-relaxed">
          Note : {customNotes}
        </p>
      )}
    </div>
  );
}

