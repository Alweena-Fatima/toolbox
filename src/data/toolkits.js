import { csv } from '../toolkits/csv/CsvToolkit'
import { developer } from '../toolkits/developer/DeveloperToolkit'
import { json } from '../toolkits/json/JsonToolkit'
import { markdown } from '../toolkits/markdown/MarkdownToolkit'
import { qr } from '../toolkits/qr/QrToolkit'
import { sql } from '../toolkits/sql/SqlToolkit'
import { image } from '../toolkits/image/ImageToolkit'

// Keep toolkit registration here so the app has one clear source of toolkit data.
export const toolkits = [
  json,
  developer,
  sql,
  csv,
  qr,
  markdown,
  image
]
