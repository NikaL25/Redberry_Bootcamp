export const formatCurrency = (value) => `$${Number(value ?? 0).toFixed(0)}`

export const cleanMobileNumber = (value = '') => value.replace(/\D/g, '')
