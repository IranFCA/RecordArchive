// Translation hook for the Justice Archive Platform
// Currently supports Persian (Farsi) only

import { fa } from '../locales/fa'

export type TranslationKey = keyof typeof fa

export const useTranslation = () => {
  // For now, we only support Persian
  // In the future, this could be extended to support multiple languages
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = fa

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to the key if translation not found
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  return { t }
}

export default useTranslation