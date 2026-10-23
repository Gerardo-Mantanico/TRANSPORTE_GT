const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[0-9+\- ]*$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/

export const YEAR_MIN = 1980
export const YEAR_MAX = 2100

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function passwordError(value: string): string | null {
  if (!PASSWORD_RE.test(value)) {
    return 'La contraseña debe tener 8-72 caracteres, al menos una mayúscula, una minúscula y un número.'
  }
  return null
}

export function passwordMismatch(password: string, confirm: string): string | null {
  if (password !== confirm) return 'Las contraseñas no coinciden.'
  return null
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.length > 20) return false
  if (!PHONE_RE.test(trimmed)) return false
  const hasDigit = /\d/.test(trimmed)
  return hasDigit
}

export function toIntInRange(
  raw: string,
  min: number,
  max: number,
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Este campo es obligatorio.' }
  const value = Number(trimmed)
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { ok: false, error: 'Ingresa un número entero válido.' }
  }
  if (value < min || value > max) {
    return { ok: false, error: `Ingresa un número entre ${min} y ${max}.` }
  }
  return { ok: true, value }
}

export function toNumberInRange(
  raw: string,
  min: number,
  max: number,
  label: string,
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: `Ingresa ${label}.` }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return { ok: false, error: `${label} debe ser un número válido.` }
  }
  if (value < min || value > max) {
    return { ok: false, error: `${label} debe estar entre ${min} y ${max}.` }
  }
  return { ok: true, value }
}

export function required(value: string, label: string): string | null {
  if (!value || !value.trim()) return `${label} es obligatorio.`
  return null
}

export function maxLen(value: string, max: number, label: string): string | null {
  if (value.trim().length > max) return `${label} no puede superar los ${max} caracteres.`
  return null
}

export function afterDate(
  start: string,
  end: string,
  startLabel: string,
  endLabel: string,
): string | null {
  if (!start || !end) return null
  if (new Date(end) <= new Date(start)) {
    return `${endLabel} debe ser posterior a ${startLabel}.`
  }
  return null
}
