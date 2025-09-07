/**
 * Password generation utilities
 */

/**
 * Generate a secure temporary password
 * Contains uppercase, lowercase, numbers and special characters
 * Length: 12 characters
 */
export function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('Senha deve ter pelo menos 8 caracteres');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Senha deve conter ao menos uma letra minúscula');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Senha deve conter ao menos uma letra maiúscula');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Senha deve conter ao menos um número');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Senha deve conter ao menos um caractere especial');
  
  return {
    isValid: score >= 4,
    score,
    feedback
  };
}