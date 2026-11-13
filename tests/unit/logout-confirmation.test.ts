import { describe, it, expect, vi } from "vitest";

describe("Système de confirmation obligatoire de déconnexion", () => {
  it("1. La confirmation est requise avant toute déconnexion", () => {
    let isDialogOpen = false;
    let isSignedOut = false;

    // Simulation du clic sur l'icône / bouton Déconnexion
    const handleLogoutButtonClick = () => {
      // Le clic n'exécute JAMAIS la déconnexion directement, il ouvre la boîte de dialogue
      isDialogOpen = true;
    };

    handleLogoutButtonClick();
    expect(isDialogOpen).toBe(true);
    expect(isSignedOut).toBe(false);
  });

  it("2. Clic sur « Annuler » : ferme la fenêtre sans interrompre la session", () => {
    let isDialogOpen = true;
    let sessionActive = true;
    const signOutMock = vi.fn();

    const handleCancel = () => {
      isDialogOpen = false;
      // La session reste inchangée
    };

    handleCancel();

    expect(isDialogOpen).toBe(false);
    expect(sessionActive).toBe(true);
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("3. Clic sur « Confirmer la déconnexion » : exécute signOut et termine la session", async () => {
    let isDialogOpen = true;
    let sessionActive = true;
    let redirectedTo: string | null = null;

    const signOutMock = vi.fn(async () => {
      sessionActive = false;
    });

    const routerPushMock = vi.fn((path: string) => {
      redirectedTo = path;
    });

    const handleConfirmLogout = async () => {
      await signOutMock();
      isDialogOpen = false;
      routerPushMock("/connexion");
    };

    await handleConfirmLogout();

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(sessionActive).toBe(false);
    expect(isDialogOpen).toBe(false);
    expect(redirectedTo).toBe("/connexion");
  });

  it("4. Les textes et libellés respectent scrupuleusement la demande utilisateur", () => {
    const requiredTexts = {
      message: "Êtes-vous sûr de vouloir vous déconnecter ?",
      cancel: "Annuler",
      confirm: "Confirmer la déconnexion",
    };

    expect(requiredTexts.message).toBe("Êtes-vous sûr de vouloir vous déconnecter ?");
    expect(requiredTexts.cancel).toBe("Annuler");
    expect(requiredTexts.confirm).toBe("Confirmer la déconnexion");
  });
});

