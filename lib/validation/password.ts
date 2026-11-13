export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * Valide les exigences de sécurité renforcées pour le mot de passe :
 * - Minimum 8 caractères
 * - Au moins une lettre (alphabétique)
 * - Au moins un chiffre (0-9)
 * - Au moins un caractère spécial (!@#$%^&*...)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  const score = [hasMinLength, hasLetter, hasNumber, hasSpecialChar].filter(Boolean).length;
  const isValid = hasMinLength && hasLetter && hasNumber && hasSpecialChar;

  return {
    isValid,
    score,
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecialChar,
  };
}

