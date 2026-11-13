"use client";

import React, { useState } from "react";
import { Banknote, CheckSquare, CreditCard } from "lucide-react";

interface PaymentProviderLogoProps {
  providerId: string;
  size?: number | string;
  className?: string;
}

interface ProviderMeta {
  src?: string;
  alt: string;
  bg?: string;
  padding?: string;
  objectFit?: "contain" | "cover";
}

const PROVIDER_LOGOS: Record<string, ProviderMeta> = {
  // ==========================================
  // A. MOBILE MONEY
  // ==========================================
  wave: {
    src: "/images/payments/wave.png",
    alt: "Wave",
    bg: "bg-[#1DC3EC]",
    padding: "p-0",
    objectFit: "cover",
  },
  airtel_money: {
    src: "/images/payments/airtel_money.png",
    alt: "Airtel Money",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  celtis_benin: {
    src: "/images/payments/celtis.jpg",
    alt: "CELTIIS Bénin",
    bg: "bg-[#1B365D]",
    padding: "p-0",
    objectFit: "cover",
  },
  moov_money: {
    src: "/images/payments/moov_money.jpg",
    alt: "Moov Money (Moov Africa)",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  mtn_momo: {
    src: "/images/payments/mtn_momo.svg",
    alt: "MTN Mobile Money",
    bg: "bg-[#FFCC00]",
    padding: "p-0.5",
    objectFit: "contain",
  },
  orange_money: {
    src: "/images/payments/orange_money.png",
    alt: "Orange Money",
    bg: "bg-[#FF7900]",
    padding: "p-0",
    objectFit: "cover",
  },
  t_money: {
    src: "/images/payments/tmoney.jpg",
    alt: "T-Money",
    bg: "bg-[#FFD100]",
    padding: "p-0",
    objectFit: "cover",
  },

  // ==========================================
  // B. BANQUES UEMOA
  // ==========================================
  bank_of_africa: {
    src: "/images/payments/bank_of_africa.png",
    alt: "Bank of Africa (BOA)",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  banque_atlantique: {
    src: "/images/payments/banque_atlantique.png",
    alt: "Banque Atlantique",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  bdm: {
    src: "/images/payments/bdm.png",
    alt: "BDM (Banque de Développement du Mali)",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  bdu: {
    src: "/images/payments/bdu.png",
    alt: "BDU (Banque de l'Union)",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  bgfibank: {
    src: "/images/payments/bgfibank.jpg",
    alt: "BGFIBank",
    bg: "bg-[#002B49]",
    padding: "p-0.5",
    objectFit: "contain",
  },
  biic_benin: {
    src: "/images/payments/biic_benin.png",
    alt: "BIIC Bénin",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  bridge_bank: {
    src: "/images/payments/bridge_bank.svg",
    alt: "Bridge Bank Group",
    bg: "bg-[#8A1538]",
    padding: "p-1",
    objectFit: "contain",
  },
  bsic: {
    src: "/images/payments/bsic.png",
    alt: "BSIC (Banque Sahélo-Saharienne)",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  cbao: {
    src: "/images/payments/cbao.svg",
    alt: "CBAO (Attijariwafa bank)",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  coris_bank: {
    src: "/images/payments/coris_bank.svg",
    alt: "Coris Bank International",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  ecobank: {
    src: "/images/payments/ecobank.svg",
    alt: "Ecobank",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  fbnbank: {
    src: "/images/payments/fbnbank.png",
    alt: "FBNBank (First Bank of Nigeria)",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  nsia_banque: {
    src: "/images/payments/nsia_banque.png",
    alt: "NSIA Banque",
    bg: "bg-[#002855]",
    padding: "p-0.5",
    objectFit: "contain",
  },
  orabank: {
    src: "/images/payments/orabank.png",
    alt: "Orabank",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  societe_generale: {
    src: "/images/payments/societe_generale.svg",
    alt: "Société Générale",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  stanbic_bank: {
    src: "/images/payments/stanbic_bank.svg",
    alt: "Stanbic Bank",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  uba: {
    src: "/images/payments/uba.png",
    alt: "UBA (United Bank for Africa)",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },

  // ==========================================
  // C. SERVICES DE TRANSFERT ET PAIEMENT
  // ==========================================
  amana_transfert: {
    src: "/images/payments/amana.png",
    alt: "Amana Transfert d'argent",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  binance_pay: {
    src: "/images/payments/binance_pay.png",
    alt: "Binance Pay",
    bg: "bg-[#181A20]",
    padding: "p-0",
    objectFit: "cover",
  },
  moneygram: {
    src: "/images/payments/moneygram.png",
    alt: "MoneyGram",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  mynita: {
    src: "/images/payments/mynita.png",
    alt: "MyNita (Nita Transfert)",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
  ria: {
    src: "/images/payments/ria.jpg",
    alt: "Ria Money Transfer",
    bg: "bg-[#FF6100]",
    padding: "p-0",
    objectFit: "cover",
  },
  sendwave: {
    src: "/images/payments/sendwave.png",
    alt: "Sendwave",
    bg: "bg-[#FFEC00]",
    padding: "p-0",
    objectFit: "cover",
  },
  taptap_send: {
    src: "/images/payments/taptap_send.png",
    alt: "Taptap Send",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  western_union: {
    src: "/images/payments/western_union.svg",
    alt: "Western Union",
    bg: "bg-[#FFDD00]",
    padding: "p-1",
    objectFit: "contain",
  },
  wizall_money: {
    src: "/images/payments/wizall_money.png",
    alt: "Wizall Money",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },

  // ==========================================
  // D. CRYPTOMONNAIES
  // ==========================================
  bitcoin: {
    src: "/images/payments/bitcoin.svg",
    alt: "Bitcoin (BTC)",
    bg: "bg-white",
    padding: "p-0.5",
    objectFit: "contain",
  },
  ethereum: {
    src: "/images/payments/ethereum.svg",
    alt: "Ethereum (ETH)",
    bg: "bg-white",
    padding: "p-1.5",
    objectFit: "contain",
  },
  solana: {
    src: "/images/payments/solana.svg",
    alt: "Solana (SOL)",
    bg: "bg-[#0F172A]",
    padding: "p-1.5",
    objectFit: "contain",
  },
  tether_usdt: {
    src: "/images/payments/tether_usdt.svg",
    alt: "Tether USD (USDT)",
    bg: "bg-white",
    padding: "p-1.5",
    objectFit: "contain",
  },
  usd_coin: {
    src: "/images/payments/usd_coin.svg",
    alt: "USD Coin (USDC)",
    bg: "bg-white",
    padding: "p-1",
    objectFit: "contain",
  },
};

export function PaymentProviderLogo({
  providerId,
  size = 32,
  className = "",
}: PaymentProviderLogoProps) {
  const [hasError, setHasError] = useState(false);
  const s = typeof size === "number" ? `${size}px` : size;

  // Cas particuliers : Espèces & Chèques
  if (providerId === "cash") {
    return (
      <div
        style={{ width: s, height: s, minWidth: s, minHeight: s }}
        className={`shrink-0 rounded-xl bg-emerald-600 flex items-center justify-center p-1.5 shadow-xs text-white select-none ring-1 ring-emerald-500/30 ${className}`}
        title="Comptant en espèces"
      >
        <Banknote className="w-full h-full stroke-[2.2]" />
      </div>
    );
  }

  if (providerId === "cheque") {
    return (
      <div
        style={{ width: s, height: s, minWidth: s, minHeight: s }}
        className={`shrink-0 rounded-xl bg-blue-700 flex items-center justify-center p-1.5 shadow-xs text-white select-none ring-1 ring-blue-600/30 ${className}`}
        title="Chèque bancaire"
      >
        <CheckSquare className="w-full h-full stroke-[2.2]" />
      </div>
    );
  }

  const meta = PROVIDER_LOGOS[providerId];

  // Si on a le logo officiel et qu'il n'a pas échoué
  if (meta && meta.src && !hasError) {
    const bgClass = meta.bg || "bg-white";
    const padClass = meta.padding || "p-0.5";
    const fitClass = meta.objectFit === "cover" ? "object-cover" : "object-contain";

    return (
      <div
        style={{ width: s, height: s, minWidth: s, minHeight: s }}
        className={`relative shrink-0 rounded-xl ${bgClass} border border-border/50 dark:border-border/60 shadow-xs flex items-center justify-center overflow-hidden ${padClass} select-none transition-all duration-150 ${className}`}
        title={meta.alt}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.src}
          alt={meta.alt}
          className={`max-w-full max-h-full w-auto h-auto ${fitClass} rounded-lg`}
          onError={() => setHasError(true)}
          loading="eager"
        />
      </div>
    );
  }

  // Fallback élégant avec icône générique
  return (
    <div
      style={{ width: s, height: s, minWidth: s, minHeight: s }}
      className={`shrink-0 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center p-1.5 shadow-xs select-none ${className}`}
      title={meta?.alt || providerId}
    >
      <CreditCard className="w-full h-full stroke-[2]" />
    </div>
  );
}
