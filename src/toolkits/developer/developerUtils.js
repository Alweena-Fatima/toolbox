//Base64 is a way to represent binary data using text characters.
function decodeBase64Url(value) {
  //trim whitespace and replace - with + and _ with / g means global. It replaces all matching occurrences, not just the first one.
  let base64 = value.trim().replace(/-/g, '+').replace(/_/g, '/')

  // Base64 strings are padded so there length is divisible by 4. If the length is not divisible by 4, we add padding characters (=) to the end of the string until it is.
  while (base64.length % 4 !== 0) {
    base64 += '='
  }

  const binaryText = atob(base64) //It decodes Base64 into a binary string.
  const bytes = new Uint8Array(binaryText.length)//It is a JavaScript typed array that stores numbers from 0 to 255. Each number represents one byte.



  for (let index = 0; index < binaryText.length; index++) {
    bytes[index] = binaryText.charCodeAt(index)
  }

  return new TextDecoder().decode(bytes)
}
//UUID stands for Universally Unique Identifier.
export function generateUuids(countInput) {
  const requestedCount = Number(countInput)
  const count = Math.min(50, Math.max(1, requestedCount || 1))
  const uuids = []

  for (let index = 0; index < count; index++) {
    uuids.push(crypto.randomUUID())
  }

  return uuids.join('\n')
}

export function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text)
  let binaryText = ''

  for (let index = 0; index < bytes.length; index++) {
    binaryText += String.fromCharCode(bytes[index])
  }

  return btoa(binaryText)
}

export function decodeBase64(text) {
  return decodeBase64Url(text)
}

export function encodeUrl(text) {
  return encodeURIComponent(text)
}

export function decodeUrl(text) {
  return decodeURIComponent(text)
}

export function decodeJwt(token) {
  const parts = token.trim().split('.')

  if (parts.length !== 3) {
    throw new Error('A JWT has 3 parts separated by dots.')
  }

  // Displaying JWT contents does not verify the token signature.
  const header = JSON.parse(decodeBase64Url(parts[0]))
  const payload = JSON.parse(decodeBase64Url(parts[1]))

  return `HEADER
${JSON.stringify(header, null, 2)}

PAYLOAD
${JSON.stringify(payload, null, 2)}`
}

export async function createSha256Hash(text) {
  const bytes = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const hashBytes = new Uint8Array(hashBuffer)
  let hexadecimalHash = ''

  for (let index = 0; index < hashBytes.length; index++) {
    hexadecimalHash += hashBytes[index].toString(16).padStart(2, '0')
  }

  return hexadecimalHash
}

export function testRegularExpression(pattern, flags, text) {
  let regexFlags = flags
  if (!regexFlags.includes('g')) {
    regexFlags += 'g'
  }

  const expression = new RegExp(pattern, regexFlags)
  const matches = []
  let match = expression.exec(text)

  while (match) {
    matches.push(`#${matches.length + 1} at ${match.index}: ${match[0]}`)

    // Move past an empty match so the expression cannot loop forever.
    if (match[0] === '') {
      expression.lastIndex++
    }

    match = expression.exec(text)
  }

  if (matches.length === 0) {
    return 'No matches found.'
  }

  return matches.join('\n')
}
