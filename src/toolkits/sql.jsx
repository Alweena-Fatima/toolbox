// Build topics: SQL syntax and formatting, CSV parsing, SQL identifiers and
// literal escaping, comment removal, and composing tools with React props.
import { Database } from 'lucide-react'
import { format } from 'sql-formatter'
import Papa from 'papaparse'
import TextTool from '../components/TextTool'

const SAMPLE_QUERY =
  "select id,name from users where age>18 and city='Pune' order by name"

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
      component: () => (
        <TextTool
          file="query.sql"
          sample={[SAMPLE_QUERY]}
          modes={[
            {
              label: 'Format',
              run: ([source]) =>
                format(source, { keywordCase: 'upper' })
            }
          ]}
        />
      )
    },
    {
      id: 'minifier',
      name: 'SQL Minifier',
      desc: 'Remove comments and extra spaces.',
      component: () => (
        <TextTool
          file="min.sql"
          sample={['-- users\nSELECT *\n  FROM users\n WHERE id = 1;']}
          modes={[
            {
              label: 'Minify',
              run: ([source]) =>
                source
                  .replace(/--.*$/gm, '')
                  .replace(/\/\*[\s\S]*?\*\//g, '')
                  .replace(/\s+/g, ' ')
                  .trim()
            }
          ]}
        />
      )
    },
    {
      id: 'insert',
      name: 'SQL INSERT Generator',
      desc: 'Turn CSV rows into INSERT statements.',
      component: () => (
        <TextTool
          file="inserts.sql"
          fields={['Table name', 'CSV (first row = column names)']}
          sample={['users', "id,name,city\n1,Asha,Pune\n2,O'Neil,"]}
          modes={[
            {
              label: 'Generate',
              run: ([tableName, csvText]) => {
                const parsed = Papa.parse(csvText.trim(), {
                  header: true,
                  skipEmptyLines: true
                })
                const columns = parsed.meta.fields || []

                // A header row supplies the INSERT column list and row field names.
                if (!columns.length) {
                  throw new Error('Add a CSV with a header row.')
                }

                return parsed.data
                  .map(row => {
                    const values = columns.map(column => {
                      const value = row[column]

                      if (!value) {
                        return 'NULL'
                      }

                      // Escape apostrophes in text values for SQL string literals.
                      return isNaN(+value)
                        ? `'${value.replace(/'/g, "''")}'`
                        : value
                    })

                    return `INSERT INTO ${tableName || 'my_table'} (${columns.join(', ')}) VALUES (${values.join(', ')});`
                  })
                  .join('\n')
              }
            }
          ]}
        />
      )
    }
  ]
}
