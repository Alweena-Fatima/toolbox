import { Wrench } from 'lucide-react'
import TextTool from '../../components/TextTool'
import {
  createSha256Hash,
  decodeBase64,
  decodeJwt,
  decodeUrl,
  encodeBase64,
  encodeUrl,
  generateUuids,
  testRegularExpression
} from './developerUtils'

function UuidGeneratorTool() {
  function handleGenerate(inputs) {
    return generateUuids(inputs[0])
  }

  return (
    <TextTool
      fields={['How many? (1–50)']}
      sample={['5']}
      buttonLabel="Generate"
      onConvert={handleGenerate}
    />
  )
}

function Base64Tool() {
  function handleEncode(inputs) {
    return encodeBase64(inputs[0])
  }

  function handleDecode(inputs) {
    return decodeBase64(inputs[0])
  }

  return (
    <TextTool
      sample={['Hello, Toolbox!']}
      actions={[
        { label: 'Encode', onConvert: handleEncode },
        { label: 'Decode', onConvert: handleDecode }
      ]}
    />
  )
}

function UrlTool() {
  function handleEncode(inputs) {
    return encodeUrl(inputs[0])
  }

  function handleDecode(inputs) {
    return decodeUrl(inputs[0])
  }

  return (
    <TextTool
      sample={['hello world & friends']}
      actions={[
        { label: 'Encode', onConvert: handleEncode },
        { label: 'Decode', onConvert: handleDecode }
      ]}
    />
  )
}

function JwtDecoderTool() {
  function handleDecode(inputs) {
    return decodeJwt(inputs[0])
  }

  return (
    <TextTool
      sample={[
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIn0.signature'
      ]}
      buttonLabel="Decode"
      onConvert={handleDecode}
    />
  )
}

function Sha256GeneratorTool() {
  function handleHash(inputs) {
    return createSha256Hash(inputs[0])
  }

  return (
    <TextTool
      sample={['hello']}
      buttonLabel="Hash"
      onConvert={handleHash}
    />
  )
}

function RegexTesterTool() {
  function handleTest(inputs) {
    return testRegularExpression(inputs[0], inputs[1], inputs[2])
  }

  return (
    <TextTool
      fields={['Pattern', 'Flags (e.g. gi)', 'Text']}
      sample={['\\d+', 'g', 'Order 66 has 3 items']}
      buttonLabel="Test"
      onConvert={handleTest}
    />
  )
}

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
      component: UuidGeneratorTool
    },
    {
      id: 'base64',
      name: 'Base64 Encoder / Decoder',
      desc: 'Convert text to and from Base64.',
      component: Base64Tool
    },
    {
      id: 'url',
      name: 'URL Encoder / Decoder',
      desc: 'Make text safe for URLs.',
      component: UrlTool
    },
    {
      id: 'jwt',
      name: 'JWT Decoder',
      desc: 'Peek inside a JWT token (no verification).',
      component: JwtDecoderTool
    },
    {
      id: 'sha256',
      name: 'SHA-256 Hash Generator',
      desc: 'Hash any text with SHA-256.',
      component: Sha256GeneratorTool
    },
    {
      id: 'regex',
      name: 'Regex Tester',
      desc: 'Try a pattern and see the matches.',
      component: RegexTesterTool
    }
  ]
}
