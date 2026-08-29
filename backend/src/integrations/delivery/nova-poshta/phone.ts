export function toNpPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0'))
    digits = `38${digits}`
  if (digits.length === 9)
    digits = `380${digits}`
  return digits
}

export function senderPhoneFromCredentials(credentials: { type?: string, phone?: string } | null | undefined): string | undefined {
  const phone = credentials?.phone?.trim()
  if (phone == null || phone === '')
    return undefined
  const normalized = toNpPhone(phone)
  return normalized.length >= 10 ? normalized : undefined
}
