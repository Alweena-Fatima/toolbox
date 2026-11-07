import Papa from 'papaparse' //  used to convert CSV to JSON and vice versa
//gives two method papa.parse() and papa.unparse() to convert csv to json and vice versa
// We use a library because CSV has special formatting rules, such as commas inside quoted values and newlines inside cells.
// For example:
// name,city
// Asha,"Pune, Maharashtra"
// Ravi,Delhi
// A simple split(',') would incorrectly split Asha's city into two columns. Papa Parse handles this correctly.
export const sampleCsv = 
`name,city
Asha,Pune
Ravi,Delhi
Ravi,Delhi`

function throwCsvError(result) {
  for (let index = 0; index < result.errors.length; index++) {
    const parseError = result.errors[index]

    // Papa Parse reports this warning for valid one-column CSV data.
    if (parseError.code !== 'UndetectableDelimiter') {
      throw new Error(parseError.message)
    }
  }
}

export function convertCsvToJson(csvText) {
  const result = Papa.parse(csvText, {
    header: true, //Tells Papa Parse to treat the first row as column names.
    skipEmptyLines: true //Ignores completely empty lines.
  }) //this return object with data and errors array. {
//   data: [
//     { name: 'Asha', city: 'Pune' },
//     { name: 'Ravi', city: 'Delhi' }
//   ],
//   errors: [],

//   meta: {
//     delimiter: ','
//   }
// } so we loop through errors array and throw error if any error is found. If no error is found we return result.data which is an array of objects.

  throwCsvError(result)
 //result.data contains JavaScript objects. we need to convert it into a JSON string. We use JSON.stringify().
  return JSON.stringify(result.data, null, 2)
}

export function convertJsonToCsv(jsonText) {
  const jsonData = JSON.parse(jsonText) //convert the json string into js object 

  if (!Array.isArray(jsonData)) {
    throw new Error('JSON must be an array of objects.')
  }
  //check if every item in the array is an object. If not throw error
  for (let index = 0; index < jsonData.length; index++) {
    const row = jsonData[index]
    
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('Every item in the JSON array must be an object.')
    }
  }
  //Papa.unparse() takes an array of objects and converts it into a CSV string. It automatically uses the object keys as column names and handles special formatting rules, such as quoting values that contain commas or newlines.
  return Papa.unparse(jsonData)
}

export function cleanCsv(csvText) {
  const result = Papa.parse(csvText, {
    skipEmptyLines: 'greedy' //here we are not using header  this time we want every row as an array, including the header.
    //Papa Parse to skip empty lines, including lines containing only whitespace.
  })
  throwCsvError(result)
  //this array will store the cleaned rows 
  const cleanedRows = []

  for (let rowIndex = 0; rowIndex < result.data.length; rowIndex++) {
    const originalRow = result.data[rowIndex]
    const cleanedRow = []
    //loop every cell in the row and trim whitespace  then push in array cleanedRow
    for (let cellIndex = 0; cellIndex < originalRow.length; cellIndex++) {
      cleanedRow.push(originalRow[cellIndex].trim())
    }

    cleanedRows.push(cleanedRow)
  }

  // Keep the first copy of each row while preserving the original row order.
  const uniqueRows = []
  const seenRows = []

  for (let rowIndex = 0; rowIndex < cleanedRows.length; rowIndex++) {
    const row = cleanedRows[rowIndex]
    const rowKey = JSON.stringify(row) //convert the row array into string so that it will be easy to compare 
    let isDuplicate = false

    for (let seenIndex = 0; seenIndex < seenRows.length; seenIndex++) {
      if (seenRows[seenIndex] === rowKey) {
        isDuplicate = true
        break
      }
    }

    if (!isDuplicate) {
      seenRows.push(rowKey)
      uniqueRows.push(row)
    }
  }

  return Papa.unparse(uniqueRows)
}
