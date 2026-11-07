import { Braces } from 'lucide-react'
import TextTool from '../../components/TextTool'
import {
  compareJson,
  formatJson,
  minifyJson,
  sampleJson,
  validateJson
} from './jsonUtils'

function JsonFormatterTool() {
  function handleFormat(inputs) {
    return formatJson(inputs[0])
  }

  return (
    <TextTool
      file="formatted.json"
      sample={[sampleJson]}
      buttonLabel="Format"
      onConvert={handleFormat}
    />
  )
}

function JsonValidatorTool() {
  function handleValidate(inputs) {
    return validateJson(inputs[0])
  }

  return (
    <TextTool
      sample={[sampleJson]}
      buttonLabel="Validate"
      onConvert={handleValidate}
    />
  )
}

function JsonMinifierTool() {
  function handleMinify(inputs) {
    return minifyJson(inputs[0])
  }

  return (
    <TextTool
      file="min.json"
      sample={['{\n  "a": 1,\n  "b": [1, 2]\n}']}
      buttonLabel="Minify"
      onConvert={handleMinify}
    />
  )
}

function JsonDiffTool() {
  function handleCompare(inputs) {
    return compareJson(inputs[0], inputs[1])
  }

  return (
    <TextTool
      fields={['Original JSON', 'Changed JSON']}
      sample={['{"a":1,"b":2}', '{"a":1,"b":3,"c":4}']}
      buttonLabel="Compare"
      onConvert={handleCompare}
    />
  )
}

export const json = {
  id: 'json',
  name: 'JSON Toolkit',
  desc: 'Tidy, check and compare JSON.',
  color: '#ffd6a5',
  icon: Braces,
  tools: [
    {
      id: 'formatter',
      name: 'JSON Formatter',
      desc: 'Make JSON neat and readable.',
      component: JsonFormatterTool
    },
    {
      id: 'validator',
      name: 'JSON Validator',
      desc: 'Check if JSON is valid.',
      component: JsonValidatorTool
    },
    {
      id: 'minifier',
      name: 'JSON Minifier',
      desc: 'Squash JSON into one line.',
      component: JsonMinifierTool
    },
    {
      id: 'diff',
      name: 'JSON Diff',
      desc: 'See what changed between two JSON files.',
      component: JsonDiffTool
    }
  ]
}
