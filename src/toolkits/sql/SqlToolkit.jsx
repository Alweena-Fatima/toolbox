import { Database } from 'lucide-react'
import TextTool from '../../components/TextTool'
import {
  formatSql,
  generateInsertStatements,
  minifySql,
  sampleQuery
} from './sqlUtils'

function SqlFormatterTool() {
  function handleFormat(inputs) {
    return formatSql(inputs[0])
  }

  return (
    <TextTool
      file="query.sql"
      sample={[sampleQuery]}
      buttonLabel="Format"
      onConvert={handleFormat}
    />
  )
}

function SqlMinifierTool() {
  function handleMinify(inputs) {
    return minifySql(inputs[0])
  }

  return (
    <TextTool
      file="min.sql"
      sample={['-- users\nSELECT *\n  FROM users\n WHERE id = 1;']}
      buttonLabel="Minify"
      onConvert={handleMinify}
    />
  )
}

function SqlInsertGeneratorTool() {
  function handleGenerate(inputs) {
    return generateInsertStatements(inputs[0], inputs[1])
  }

  return (
    <TextTool
      file="inserts.sql"
      fields={['Table name', 'CSV (first row = column names)']}
      sample={['users', "id,name,city\n1,Asha,Pune\n2,O'Neil,"]}
      buttonLabel="Generate"
      onConvert={handleGenerate}
    />
  )
}

export const sql = {
  id: 'sql',
  name: 'SQL Toolkit',
  desc: 'Format, shrink and generate SQL.',
  color: '#bdb2ff',
  icon: Database,
  tools: [
    {
      id: 'formatter',
      name: 'SQL Formatter',
      desc: 'Make queries easy to read.',
      component: SqlFormatterTool
    },
    {
      id: 'minifier',
      name: 'SQL Minifier',
      desc: 'Remove comments and extra spaces.',
      component: SqlMinifierTool
    },
    {
      id: 'insert',
      name: 'SQL INSERT Generator',
      desc: 'Turn CSV rows into INSERT statements.',
      component: SqlInsertGeneratorTool
    }
  ]
}
