// Build topics: CSV structure and escaping, Papa Parse, JSON arrays/objects,
// table normalization and deduplication, and composing tools with React props.
import { Table } from 'lucide-react'
import Papa from 'papaparse'
import TextTool from '../components/TextTool'

const S = 'name,city\nAsha,Pune\nRavi,Delhi\nRavi,Delhi\n'

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
            component: () => (
                <TextTool
                    file="data.json"
                    sample={[S]}
                    modes={[
                        {
                            label: 'Convert',
                            run: ([s]) => {
                                // Treat the first row as field names and ignore blank lines.
                                const rows = Papa.parse(s.trim(), {
                                    header: true,
                                    skipEmptyLines: true
                                }).data

                                return JSON.stringify(rows, null, 2)
                            }
                        }
                    ]}
                />
            )
        },
        {
            id: 'json-to-csv',
            name: 'JSON to CSV',
            desc: 'Turn a JSON array into CSV.',
            component: () => (
                <TextTool
                    file="data.csv"
                    sample={['[{"name":"Asha","city":"Pune"},{"name":"Ravi","city":"Delhi"}]']}
                    modes={[
                        {
                            label: 'Convert',
                            run: ([s]) => {
                                const rows = JSON.parse(s)

                                // Papa Parse expects rows; reject other JSON shapes before conversion.
                                if (!Array.isArray(rows)) {
                                    throw new Error('JSON must be an array of objects.')
                                }

                                return Papa.unparse(rows)
                            }
                        }
                    ]}
                />
            )
        },
        {
            id: 'cleaner',
            name: 'CSV Cleaner',
            desc: 'Trim cells, drop empty and duplicate rows.',
            component: () => (
                <TextTool
                    file="clean.csv"
                    sample={[S + ',\n']}
                    modes={[
                        {
                            label: 'Clean',
                            run: ([s]) => {
                                const rows = Papa.parse(s, {
                                    skipEmptyLines: 'greedy'
                                }).data.map(row => row.map(cell => cell.trim()))

                                // JSON row keys preserve column order while Map keeps the first copy.
                                const uniqueRows = [
                                    ...new Map(
                                        rows.map(row => [JSON.stringify(row), row])
                                    ).values()
                                ]

                                return Papa.unparse(uniqueRows)
                            }
                        }
                    ]}
                />
            )
        }
    ]
}
