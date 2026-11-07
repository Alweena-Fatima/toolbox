import { Table } from 'lucide-react'
import TextTool from '../../components/TextTool'
import {
  cleanCsv,
  convertCsvToJson,
  convertJsonToCsv,
  sampleCsv
} from './csvUtils'

function CsvToJsonTool() {
  function handleConvert(inputs) {
    return convertCsvToJson(inputs[0])
  }

  return (
    <TextTool
      file="data.json"
      sample={[sampleCsv]}
      buttonLabel="Convert"
      onConvert={handleConvert}
    />
  )
}

function JsonToCsvTool() {
  function handleConvert(inputs) {
    return convertJsonToCsv(inputs[0])
  }

  return (
    <TextTool
      file="data.csv"
      sample={['[{"name":"Asha","city":"Pune"},{"name":"Ravi","city":"Delhi"}]']}
      buttonLabel="Convert"
      onConvert={handleConvert}
    />
  )
}

function CsvCleanerTool() {
  function handleClean(inputs) {
    return cleanCsv(inputs[0])
  }

  return (
    <TextTool
      file="clean.csv"
      sample={[sampleCsv]}
      buttonLabel="Clean"
      onConvert={handleClean}
    />
  )
}

export const csv = {
  id: 'csv',
  name: 'CSV Toolkit',
  desc: 'Convert and clean tables.',
  color: '#9bf6ff',
  icon: Table,
  tools: [
    {
      id: 'csv-to-json',
      name: 'CSV to JSON',
      desc: 'Turn CSV rows into JSON.',
      component: CsvToJsonTool
    },
    {
      id: 'json-to-csv',
      name: 'JSON to CSV',
      desc: 'Turn a JSON array into CSV.',
      component: JsonToCsvTool
    },
    {
      id: 'cleaner',
      name: 'CSV Cleaner',
      desc: 'Trim cells, drop empty and duplicate rows.',
      component: CsvCleanerTool
    }
  ]
}
