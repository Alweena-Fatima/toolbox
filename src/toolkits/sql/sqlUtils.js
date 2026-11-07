import { format } from 'sql-formatter' //use to formal sql 
import Papa from 'papaparse' //read csv file and convert to sql 

export const sampleQuery =
  "select id,name from users where age>18 and city='Pune' order by name"

function throwCsvError(parsedCsv) {
  for (let index = 0; index < parsedCsv.errors.length; index++) {
    const parseError = parsedCsv.errors[index]

    // A one-column CSV is valid even when Papa Parse cannot infer a delimiter.
    if (parseError.code !== 'UndetectableDelimiter') {
      throw new Error(parseError.message)
    }
  }
}

export function formatSql(sqlText) {
  return format(sqlText, { keywordCase: 'upper' }) //convert the sql keywords in caps 
}

export function minifySql(sqlText) {
  const withoutLineComments = sqlText.replace(/--.*$/gm, '') //remove single line comments 
  const withoutBlockComments = withoutLineComments.replace( 
    /\/\*[\s\S]*?\*\//g,
    ''
  ) //remove block comments

  return withoutBlockComments.replace(/\s+/g, ' ').trim() //trim 
}
//take csv and generate sql inster query 
export function generateInsertStatements(tableNameInput, csvTextInput) {
  const tableName = tableNameInput.trim() || 'my_table'
  const csvText = csvTextInput.trim()
  //no text in csv give error 
  if (!csvText) {
    throw new Error('Add a CSV with a header row.')
  }
  //convert csv to js object using papa parser 
  const parsedCsv = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  })

  throwCsvError(parsedCsv)

  const columns = parsedCsv.meta.fields || [] //this meta field contains column name of csv if no head then how we will get the column for table 
  if (columns.length === 0) {
    throw new Error('Add a CSV with a header row.')
  }

  const statements = [] //will store the instert query 
  
  for (let rowIndex = 0; rowIndex < parsedCsv.data.length; rowIndex++) {
    const row = parsedCsv.data[rowIndex]
    const values = []

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const value = row[columns[columnIndex]]
      //loop through each cell and check for null or string or number and push in array values
      if (!value) {
        values.push('NULL')
      } else if (isNaN(Number(value))) {
        // SQL escapes a quote inside a text literal by doubling it.
        const escapedValue = value.replace(/'/g, "''")
        values.push(`'${escapedValue}'`)
      } else {
        values.push(value)
      }
    }
    //now add the insert query in statements array using table name, columns and values
    statements.push(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`
    )
  }

  return statements.join('\n')
}
