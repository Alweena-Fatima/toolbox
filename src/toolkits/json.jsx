// Build topics: JSON syntax and parsing/stringifying, object/array traversal,
// recursive structural comparison, React component composition, and text input.
import { Braces } from 'lucide-react'
import TextTool from '../components/TextTool'

const S = '{"name":"Toolbox","tags":["cute","free"],"version":1}'

const diff = (a, b, p = '$') => {
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(k =>
      !(k in b)
        ? [`- ${p}.${k} removed`]
        : !(k in a)
          ? [`+ ${p}.${k} added: ${JSON.stringify(b[k])}`]
          : diff(a[k], b[k], `${p}.${k}`)
    )
  }

  return JSON.stringify(a) === JSON.stringify(b)
    ? []
    : [`~ ${p}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`]
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
      component: () => (
        <TextTool
          file="formatted.json"
          sample={[S]}
          modes={[{
            label: 'Format',
            run: ([s]) => JSON.stringify(JSON.parse(s), null, 2)
          }]}
        />
      )
    },
    {
      id: 'validator',
      name: 'JSON Validator',
      desc: 'Check if JSON is valid.',
      component: () => (
        <TextTool
          sample={[S]}
          modes={[{
            label: 'Validate',
            run: ([s]) => {
              const j = JSON.parse(s)
              return `✓ Valid JSON (${typeof j === 'object' && j ? Object.keys(j).length + ' top-level keys' : typeof j})`
            }
          }]}
        />
      )
    },
    {
      id: 'minifier',
      name: 'JSON Minifier',
      desc: 'Squash JSON into one line.',
      component: () => (
        <TextTool
          file="min.json"
          sample={['{\n  "a": 1,\n  "b": [1, 2]\n}']}
          modes={[{
            label: 'Minify',
            run: ([s]) => JSON.stringify(JSON.parse(s))
          }]}
        />
      )
    },
    {
      id: 'diff',
      name: 'JSON Diff',
      desc: 'See what changed between two JSON files.',
      component: () => (
        <TextTool
          fields={['Original JSON', 'Changed JSON']}
          sample={['{"a":1,"b":2}', '{"a":1,"b":3,"c":4}']}
          modes={[{
            label: 'Compare',
            run: ([a, b]) => diff(JSON.parse(a), JSON.parse(b)).join('\n') || '✓ Both are identical'
          }]}
        />
      )
    }
  ]
}