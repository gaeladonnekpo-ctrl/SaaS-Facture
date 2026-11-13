import { PAYMENT_PROVIDERS } from "./data";
import { ConfiguredPaymentMethod, PaymentTermsData } from "./types";

const JSON_PREFIX = "<!--DANHOMEY_PAYMENT_METADATA:";
const JSON_SUFFIX = ":END_METADATA-->";

/**
 * Sérialise les modalités de paiement sous forme de texte clair et lisible,
 * tout en embarquant les métadonnées pour une réouverture fidèle dans le formulaire.
 */
export function serializePaymentTerms(data: PaymentTermsData): string {
  const lines: string[] = [];

  // En-tête des modalités
  lines.push("CONDITIONS & MODALITÉS DE RÈGLEMENT :");

  // Délai de paiement
  if (data.paymentTermsDays === 0) {
    lines.push("• Échéance : Règlement au comptant à réception de la facture.");
  } else {
    lines.push(`• Échéance : Règlement exigible sous ${data.paymentTermsDays} jours.`);
  }

  // Moyens de paiement sélectionnés
  if (data.methods && data.methods.length > 0) {
    lines.push("\nMOYENS DE RÈGLEMENT ACCEPTÉS :");
    data.methods.forEach((method) => {
      const provider = PAYMENT_PROVIDERS.find((p) => p.id === method.providerId);
      const name = provider?.name ?? method.providerId;
      lines.push(`▶ ${name}`);

      const entries = Object.entries(method.details || {}).filter(
        ([, v]) => Boolean(v) && v.trim() !== ""
      );

      if (entries.length > 0) {
        entries.forEach(([key, val]) => {
          const fieldDef = provider?.fields.find((f) => f.key === key);
          const label = fieldDef?.label || key;
          lines.push(`   - ${label} : ${val}`);
        });
      }
    });
  }

  // Notes personnalisées additionnelles
  if (data.customNotes && data.customNotes.trim() !== "") {
    lines.push(`\nNote complémentaire : ${data.customNotes.trim()}`);
  }

  // Mention légale BCEAO
  lines.push(
    "\nConformément aux règlements UEMOA, une pénalité égale à 3 fois le taux d'intérêt légal de la BCEAO sera appliquée en cas de retard de paiement."
  );

  // Embarquement silencieux des données structurées (commentaire HTML non visible à l'impression)
  const metadataJson = JSON.stringify({
    methods: data.methods,
    paymentTermsDays: data.paymentTermsDays,
    customNotes: data.customNotes,
  });

  return `${lines.join("\n")}\n\n${JSON_PREFIX}${metadataJson}${JSON_SUFFIX}`;
}

/**
 * Parse une chaîne de texte `notes` pour reconstituer les `PaymentTermsData`.
 * Supporte à la fois les notes structurées avec métadonnées et le texte libre existant.
 */
export function deserializePaymentTerms(rawNotes?: string | null): PaymentTermsData {
  if (!rawNotes || rawNotes.trim() === "") {
    // Default fallback: Wave & MTN pre-selected as widely standard in UEMOA
    return {
      methods: [
        {
          providerId: "wave",
          details: { phone: "+229 96 00 00 00", recipient: "DANHOMEY Technologies" },
        },
        {
          providerId: "mtn_momo",
          details: { phone: "+229 97 00 00 00", recipient: "DANHOMEY Technologies" },
        },
      ],
      paymentTermsDays: 30,
      customNotes: "",
    };
  }

  // 1. Tenter d'extraire les métadonnées embarquées
  const metaStart = rawNotes.indexOf(JSON_PREFIX);
  const metaEnd = rawNotes.indexOf(JSON_SUFFIX);

  if (metaStart !== -1 && metaEnd !== -1 && metaEnd > metaStart) {
    try {
      const jsonStr = rawNotes.slice(metaStart + JSON_PREFIX.length, metaEnd);
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.methods)) {
        return {
          methods: parsed.methods,
          paymentTermsDays: typeof parsed.paymentTermsDays === "number" ? parsed.paymentTermsDays : 30,
          customNotes: parsed.customNotes || "",
        };
      }
    } catch {
      // Ignorer l'erreur et tenter l'heuristique
    }
  }

  // 2. Heuristique pour texte existant (ex: "Règlement par Mobile Money (Wave / MTN)...")
  const lower = rawNotes.toLowerCase();
  const detectedMethods: ConfiguredPaymentMethod[] = [];

  if (lower.includes("wave")) {
    detectedMethods.push({
      providerId: "wave",
      details: { phone: "+229 96 00 00 00", recipient: "DANHOMEY Technologies" },
    });
  }
  if (lower.includes("mtn") || lower.includes("momo")) {
    detectedMethods.push({
      providerId: "mtn_momo",
      details: { phone: "+229 97 00 00 00", recipient: "DANHOMEY Technologies" },
    });
  }
  if (lower.includes("moov") || lower.includes("flooz")) {
    detectedMethods.push({
      providerId: "moov_money",
      details: { phone: "+229 95 00 00 00", recipient: "DANHOMEY Technologies" },
    });
  }
  if (lower.includes("celtis")) {
    detectedMethods.push({
      providerId: "celtis_benin",
      details: { phone: "+229 40 00 00 00", recipient: "DANHOMEY Technologies" },
    });
  }
  if (lower.includes("boa") || lower.includes("bank of africa")) {
    detectedMethods.push({
      providerId: "bank_of_africa",
      details: { iban: "BJ66 BJ06 1010 0100 1234 5678 9012", holder: "DANHOMEY Technologies SARL" },
    });
  }
  if (lower.includes("ecobank")) {
    detectedMethods.push({
      providerId: "ecobank",
      details: { iban: "BJ66 BJ06 0100 0100 1234 5678 9012", holder: "DANHOMEY Technologies SARL" },
    });
  }
  if (lower.includes("coris")) {
    detectedMethods.push({
      providerId: "coris_bank",
      details: { iban: "BJ66 BJ06 7010 0700 1234 5678 9012", holder: "DANHOMEY Technologies SARL" },
    });
  }
  if (lower.includes("espèces") || lower.includes("especes") || lower.includes("comptant")) {
    detectedMethods.push({
      providerId: "cash",
      details: { location: "Au siège de l'entreprise ou à la livraison" },
    });
  }

  // Déduire le délai de paiement
  let days = 30;
  if (lower.includes("comptant") || lower.includes("réception") || lower.includes("reception")) {
    days = 0;
  } else {
    const matchDays = rawNotes.match(/(\d+)\s*jours/i);
    if (matchDays && matchDays[1]) {
      days = parseInt(matchDays[1], 10);
    }
  }

  if (detectedMethods.length === 0) {
    detectedMethods.push({
      providerId: "wave",
      details: { phone: "+229 96 00 00 00", recipient: "DANHOMEY Technologies" },
    });
    detectedMethods.push({
      providerId: "mtn_momo",
      details: { phone: "+229 97 00 00 00", recipient: "DANHOMEY Technologies" },
    });
  }

  // Nettoyer les métadonnées pour extraire le texte libre existant
  const cleanedText = rawNotes.replace(/<!--DANHOMEY_PAYMENT_METADATA:[\s\S]*?:END_METADATA-->/g, "").trim();

  return {
    methods: detectedMethods,
    paymentTermsDays: days,
    customNotes: cleanedText.length > 200 ? "" : cleanedText,
  };
}

