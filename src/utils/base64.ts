export function encodeBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)))
}

export function decodeBase64(b64: string): string {
  return decodeURIComponent(escape(atob(b64)))
}
