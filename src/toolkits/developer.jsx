
// Build topics: browser Web Crypto, UUIDs, UTF-8 and Base64URL encoding,
// URL encoding, JWT structure (decoding is not signature verification),
// regular expressions, and composing asynchronous/synchronous TextTool modes.
import { Wrench } from 'lucide-react'
import TextTool from '../components/TextTool'

const b64d = (s) =>
  new TextDecoder().decode(
    Uint8Array.from(
      atob(s.trim().replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    )
  )

const sha = async (s) =>
  [...new Uint8Array(
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(s)
    )
  )]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

export const developer = {
  id: 'developer',
  name: 'Developer Toolkit',
  desc: 'Everyday helpers for coders.',
  color: '#caffbf',
  icon: Wrench,

  tools: [
    {
      id: 'uuid',
      name: 'UUID Generator',
      desc: 'Make random v4 UUIDs.',
      component: () => (
        <TextTool
          fields={['How many? (1–50)']}
          sample={['5']}
          modes={[
            {
              label: 'Generate',
              run: ([n]) =>
                Array.from(
                  {
                    length: Math.min(50, Math.max(1, +n || 1))
                  },
                  () => crypto.randomUUID()
                ).join('\n')
            }
          ]}
        />
      )
    },

    {
      id: 'base64',
      name: 'Base64 Encoder / Decoder',
      desc: 'Convert text to and from Base64.',
      component: () => (
        <TextTool
          sample={['Hello, Toolbox!']}
          modes={[
            {
              label: 'Encode',
              run: ([s]) =>
                btoa(
                  String.fromCharCode(
                    ...new TextEncoder().encode(s)
                  )
                )
            },
            {
              label: 'Decode',
              run: ([s]) => b64d(s)
            }
          ]}
        />
      )
    },

    {
      id: 'url',
      name: 'URL Encoder / Decoder',
      desc: 'Make text safe for URLs.',
      component: () => (
        <TextTool
          sample={['hello world & friends']}
          modes={[
            {
              label: 'Encode',
              run: ([s]) => encodeURIComponent(s)
            },
            {
              label: 'Decode',
              run: ([s]) => decodeURIComponent(s)
            }
          ]}
        />
      )
    },

    {
      id: 'jwt',
      name: 'JWT Decoder',
      desc: 'Peek inside a JWT token (no verification).',
      component: () => (
        <TextTool
          sample={[
            'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiVG9vbGJveCJ9.x'
          ]}
          modes={[
            {
              label: 'Decode',
              run: ([s]) => {
                const p = s.trim().split('.')

                if (p.length < 2) {
                  throw new Error(
                    'A JWT has 3 parts separated by dots.'
                  )
                }

                return `HEADER
${JSON.stringify(JSON.parse(b64d(p[0])), null, 2)}

PAYLOAD
${JSON.stringify(JSON.parse(b64d(p[1])), null, 2)}`
              }
            }
          ]}
        />
      )
    },

    {
      id: 'sha256',
      name: 'SHA-256 Hash Generator',
      desc: 'Hash any text with SHA-256.',
      component: () => (
        <TextTool
          sample={['hello']}
          modes={[
            {
              label: 'Hash',
              run: ([s]) => sha(s)
            }
          ]}
        />
      )
    },

    {
      id: 'regex',
      name: 'Regex Tester',
      desc: 'Try a pattern and see the matches.',
      component: () => (
        <TextTool
          fields={['Pattern', 'Flags (e.g. gi)', 'Text']}
          sample={['\\d+', 'g', 'Order 66 has 3 items']}
          modes={[
            {
              label: 'Test',
              run: ([p, f, t]) => {
                const m = [
                  ...t.matchAll(
                    new RegExp(
                      p,
                      f.includes('g') ? f : f + 'g'
                    )
                  )
                ]

                return m.length
                  ? m.map(
                      (x, i) =>
                        `#${i + 1} at ${x.index}: ${x[0]}`
                    ).join('\n')
                  : 'No matches found.'
              }
            }
          ]}
        />
      )
    }
  ]
}
