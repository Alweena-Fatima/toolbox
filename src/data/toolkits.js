import { csv } from '../toolkits/csv/CsvToolkit'
import { developer } from '../toolkits/developer/DeveloperToolkit'
import { json } from '../toolkits/json/JsonToolkit'
import { markdown } from '../toolkits/markdown/MarkdownToolkit'
import { qr } from '../toolkits/qr/QrToolkit'
import { sql } from '../toolkits/sql/SqlToolkit'
import { image } from '../toolkits/image/ImageToolkit'
import { code } from '../toolkits/codebaseanalyser/CodebaseToolkit'

// Keep toolkit registration here so the app has one clear source of toolkit data.
export const toolkits = [
  developer,
  sql,
  code,
  markdown,
  image,
  json,
  csv,
  qr
]
