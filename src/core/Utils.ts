import lngs from './lngs'

export default class Utils {
  static normalizeLng(lng) {
    const result = lngs.find((lngItem: string | string[]) => {
      if (Array.isArray(lngItem) && lngItem[1].includes(lng)) {
        return true
      }

      if (
        typeof lngItem === 'string' &&
        lng.toUpperCase() === lngItem.toUpperCase()
      ) {
        return true
      }
    })

    return result
      ? ((Array.isArray(result) ? result[0] : result) as string)
      : undefined
  }
}
