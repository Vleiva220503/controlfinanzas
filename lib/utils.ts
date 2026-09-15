// lib/utils.ts
// Utilidades generales compartidas

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind de forma segura
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera un array de meses entre start y end (formato YYYY-MM)
 */
export function generateMonthRange(start: string, end: string): string[] {
  const months: string[] = []
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)

  let year = sy
  let month = sm

  while (year < ey || (year === ey && month <= em)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return months
}

/**
 * Debounce: retrasa la ejecución de una función
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Convierte un File a base64 (para preview de adjuntos)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

/**
 * Formatea el tamaño de un archivo en bytes a unidad legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Obtiene las iniciales de un nombre de usuario
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Descarga datos como CSV
 */
export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(h => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          const str = String(val).replace(/"/g, '""')
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str}"`
            : str
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Valida si un string es un UUID v4
 */
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Clamp: limita un valor entre min y max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
