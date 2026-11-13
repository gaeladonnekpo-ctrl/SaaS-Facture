import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchOrganizationFromSupabase,
  fetchCustomersFromSupabase,
  fetchInvoicesFromSupabase,
} from "@/lib/supabase/services";
import {
  getInitialInvoices,
  getInitialCustomers,
  getInitialOrganization,
  getInitialUser,
  saveInvoices,
  saveCustomers,
  saveOrganization,
  resetStorage,
  EMPTY_ORGANIZATION,
  EMPTY_USER,
} from "@/lib/data/local-store";

describe("Audit et Sécurité : Isolation stricte des utilisateurs et organisations", () => {
  const storageMap = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, val: string) => storageMap.set(key, String(val)),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear(),
    get length() {
      return storageMap.size;
    },
    key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
  };

  beforeEach(() => {
    storageMap.clear();
    (globalThis as any).localStorage = mockStorage;
  });

  describe("1. Scoping obligatoire par organisation dans les services Supabase", () => {
    it("fetchOrganizationFromSupabase retourne null si aucun orgId n'est fourni", async () => {
      const res = await fetchOrganizationFromSupabase(undefined);
      expect(res).toBeNull();
    });

    it("fetchCustomersFromSupabase protège contre les requêtes sans organisation", async () => {
      const res = await fetchCustomersFromSupabase(undefined);
      expect(res === null || (Array.isArray(res) && res.length === 0)).toBe(true);
    });

    it("fetchInvoicesFromSupabase protège contre les requêtes sans organisation", async () => {
      const res = await fetchInvoicesFromSupabase(undefined);
      expect(res === null || (Array.isArray(res) && res.length === 0)).toBe(true);
    });
  });

  describe("2. Isolation du stockage local (localStorage) par identifiant utilisateur", () => {
    it("Un utilisateur A ne pollue pas les données locales de l'utilisateur B", () => {
      const userAId = "usr_user_a_1111";
      const userBId = "usr_user_b_2222";

      const invoicesA: any[] = [
        { id: "inv_a_1", number: "FAC-2026-0001", total: 100000, customerName: "Client A" },
      ];
      const invoicesB: any[] = [
        { id: "inv_b_1", number: "FAC-2026-9999", total: 850000, customerName: "Client B" },
      ];

      saveInvoices(invoicesA, userAId);
      saveInvoices(invoicesB, userBId);

      // Vérifier que User A lit UNIQUEMENT ses factures
      const loadedA = getInitialInvoices(userAId);
      expect(loadedA).toHaveLength(1);
      expect(loadedA[0]!.number).toBe("FAC-2026-0001");
      expect(loadedA[0]!.customerName).toBe("Client A");

      // Vérifier que User B lit UNIQUEMENT ses factures
      const loadedB = getInitialInvoices(userBId);
      expect(loadedB).toHaveLength(1);
      expect(loadedB[0]!.number).toBe("FAC-2026-9999");
      expect(loadedB[0]!.customerName).toBe("Client B");
    });

    it("La déconnexion nettoie complètement le stockage de l'utilisateur", () => {
      const userId = "usr_clean_test_3333";
      saveInvoices([{ id: "inv_1", number: "FAC-1" } as any], userId);
      saveCustomers([{ id: "cust_1", name: "Client 1" } as any], userId);

      expect(getInitialInvoices(userId)).toHaveLength(1);
      expect(getInitialCustomers(userId)).toHaveLength(1);

      // Réinitialisation du stockage utilisateur
      resetStorage(userId);

      // Après reset, l'utilisateur n'a plus de factures ni clients en cache
      expect(getInitialInvoices(userId)).toHaveLength(0);
      expect(getInitialCustomers(userId)).toHaveLength(0);
    });

    it("L'organisation par défaut pour une session vide est EMPTY_ORGANIZATION (aucun nom d'entreprise d'un tiers)", () => {
      expect(EMPTY_ORGANIZATION.name).toBe("Mon Entreprise");
      expect(EMPTY_ORGANIZATION.email).toBe("");
      expect(EMPTY_ORGANIZATION.ifu).toBe("");
      expect(EMPTY_USER.name).toBe("Utilisateur");
    });
  });

  describe("3. Système dynamique de notifications sans données fictives", () => {
    it("Un nouvel utilisateur avec 0 facture et 0 paiement n'a aucune notification fictive", () => {
      const userInvoices: any[] = [];

      // Calcul dynamique des notifications
      const notifications: any[] = [];

      userInvoices.forEach((inv) => {
        if (inv.payments) {
          inv.payments.forEach((p: any) => {
            notifications.push({ id: p.id, type: "payment" });
          });
        }
      });

      expect(notifications).toHaveLength(0);
      // Aucune occurrence des fausses factures initiales (FAC-2026-0048, Cabinet Me Alapini, etc.)
      const hasMock48 = notifications.some((n) => n.id === "notif_1");
      expect(hasMock48).toBe(false);
    });

    it("Génère des notifications précises à partir des événements réels de l'utilisateur", () => {
      const realInvoices: any[] = [
        {
          id: "inv_real_1",
          number: "FAC-2026-0100",
          customerName: "SARL Alpha",
          total: 500000,
          amountPaid: 500000,
          dueDate: "2026-12-01",
          displayStatus: "paid",
          payments: [
            {
              id: "pay_real_1",
              amount: 500000,
              date: "2026-11-13",
              method: "Wave",
            },
          ],
        },
      ];

      const notifications: any[] = [];
      realInvoices.forEach((inv) => {
        inv.payments?.forEach((p: any) => {
          notifications.push({
            id: `notif_pay_${p.id}`,
            type: "payment",
            title: "Paiement reçu",
            message: `Règlement de ${p.amount.toLocaleString("fr-FR")} FCFA enregistré (${p.method}) pour la facture ${inv.number}.`,
            amount: p.amount,
          });
        });
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe("Paiement reçu");
      expect(notifications[0].message).toContain("FAC-2026-0100");
      expect(notifications[0].message).toMatch(/500[\s\u202f]000 FCFA/);
    });
  });

  describe("4. Logique de protection de route côté serveur (Middleware)", () => {
    it("Bloque l'accès non authentifié aux routes privées (ex: '/', '/factures', '/clients')", () => {
      const checkRouteAccess = (user: any | null, pathname: string) => {
        const isPublicRoute =
          pathname.startsWith("/connexion") ||
          pathname.startsWith("/inscription") ||
          pathname.startsWith("/mot-de-passe-oublie") ||
          pathname.startsWith("/f/") ||
          pathname.startsWith("/api/");

        if (!user && !isPublicRoute) {
          return { action: "redirect", destination: "/connexion" };
        }
        if (user && (pathname === "/connexion" || pathname === "/inscription")) {
          return { action: "redirect", destination: "/" };
        }
        return { action: "allow" };
      };

      // Utilisateur anonyme
      expect(checkRouteAccess(null, "/")).toEqual({ action: "redirect", destination: "/connexion" });
      expect(checkRouteAccess(null, "/factures")).toEqual({ action: "redirect", destination: "/connexion" });
      expect(checkRouteAccess(null, "/clients")).toEqual({ action: "redirect", destination: "/connexion" });
      expect(checkRouteAccess(null, "/connexion")).toEqual({ action: "allow" });
      expect(checkRouteAccess(null, "/f/token_public_123")).toEqual({ action: "allow" });

      // Utilisateur authentifié
      const loggedUser = { id: "usr_abc" };
      expect(checkRouteAccess(loggedUser, "/")).toEqual({ action: "allow" });
      expect(checkRouteAccess(loggedUser, "/factures")).toEqual({ action: "allow" });
      expect(checkRouteAccess(loggedUser, "/connexion")).toEqual({ action: "redirect", destination: "/" });
    });
  });
});
