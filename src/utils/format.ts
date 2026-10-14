export const formatCurrency = (value: number | string | null | undefined): string =>
  `$${Number(value ?? 0).toFixed(0)}`

export const cleanMobileNumber = (value: string = ''): string => value.replace(/\D/g, '')
