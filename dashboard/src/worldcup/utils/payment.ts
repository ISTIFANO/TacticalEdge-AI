/** Base catalog prices are in e-Dirham (Đ). Demo Pi rate: ~45 π per Đ */
export function priceToPi(amountEdh: number) {
  return Math.round(amountEdh * 45 * 100) / 100
}

export function formatEdh(amount: number) {
  return `${amount.toLocaleString('fr-MA')} Đ`
}

export function formatPi(amount: number) {
  return `${amount.toLocaleString()} π`
}

export function formatDualPrice(amountEdh: number) {
  return { edh: formatEdh(amountEdh), pi: formatPi(priceToPi(amountEdh)) }
}
