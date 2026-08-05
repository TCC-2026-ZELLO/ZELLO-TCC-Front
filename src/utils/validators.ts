export function validateCpf(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return 'CPF inválido';
  if (/^(\d)\1+$/.test(digits)) return 'CPF inválido';

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9))) return 'CPF inválido';

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(10))) return 'CPF inválido';

  return null;
}

export function validateCnpj(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14) return 'CNPJ inválido';
  if (/^(\d)\1+$/.test(digits)) return 'CNPJ inválido';

  let size = digits.length - 2;
  let numbers = digits.substring(0, size);
  const checkDigits = digits.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(0))) return 'CNPJ inválido';

  size = size + 1;
  numbers = digits.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(checkDigits.charAt(1))) return 'CNPJ inválido';

  return null;
}

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10 && digits.length !== 11) return 'Telefone inválido';
  if (/^(\d)\1+$/.test(digits)) return 'Telefone inválido';
  return null;
}

export function validateCep(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 8) return 'CEP inválido';
  if (/^(\d)\1+$/.test(digits)) return 'CEP inválido';
  return null;
}
