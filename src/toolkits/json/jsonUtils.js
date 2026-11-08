export const sampleJson =
  '{"name":"Toolbox","tags":["cute","free"],"version":1}'

export function formatJson(jsonText) {
  const parsedJson = JSON.parse(jsonText) //converts a JSON string into a JavaScript value
  return JSON.stringify(parsedJson, null, 2)
}
//check if json is valid or not and return the description of json like how many top level keys are there or null or object or array
export function validateJson(jsonText) {
  const parsedJson = JSON.parse(jsonText)
  let description = typeof parsedJson //tell the data type of values 

  if (parsedJson === null) {
    description = 'null'
  } else if (typeof parsedJson === 'object') {
    description = `${Object.keys(parsedJson).length} top-level keys` //return how many top level json key is there 
  }

  return `✓ Valid JSON (${description})`
}
//rmeove whitespace and new lines 
export function minifyJson(jsonText) {
  const parsedJson = JSON.parse(jsonText)
  return JSON.stringify(parsedJson)
}
//will take two json and compare them and return the difference 
function compareValues(originalValue, changedValue, path, differences) {
  //checks that both are not null and both json is an object 
  const bothAreObjects =
    originalValue !== null &&
    changedValue !== null &&
    typeof originalValue === 'object' &&
    typeof changedValue === 'object'
  //fi both are not object then they are key value pair 
  //check if they are equal or not if not then push the difference in differences array
  if (!bothAreObjects) {
    if (JSON.stringify(originalValue) !== JSON.stringify(changedValue)) {
      differences.push(
        `~ ${path}: ${JSON.stringify(originalValue)} → ${JSON.stringify(changedValue)}`
      )
    }

    return
  }
  //get keys of both jsonn 
  const originalKeys = Object.keys(originalValue)
  const changedKeys = Object.keys(changedValue)
  const allKeys = []

  //add both keys in single array
  for (let index = 0; index < originalKeys.length; index++) {
    allKeys.push(originalKeys[index])
  }

  for (let index = 0; index < changedKeys.length; index++) {
    const key = changedKeys[index]

    if (!allKeys.includes(key)) {
      allKeys.push(key)
    }
  }

  // Walk each property once and recurse into nested values.
  for (let index = 0; index < allKeys.length; index++) {
    const key = allKeys[index]
    //if key exist in changed but not original then is added
    //if key exist in original but not changed then is removed
    const existsInOriginal = Object.prototype.hasOwnProperty.call(
      originalValue,
      key
    )
    
    const existsInChanged = Object.prototype.hasOwnProperty.call(
      changedValue,
      key
    )
    const propertyPath = `${path}.${key}`

    if (!existsInChanged) {
      differences.push(`- ${propertyPath} removed`)
    } else if (!existsInOriginal) {
      differences.push(
        `+ ${propertyPath} added: ${JSON.stringify(changedValue[key])}`
      )
    } 
    //else exist in both then compare its value 
    else {
      compareValues(
        originalValue[key],
        changedValue[key],
        propertyPath,
        differences
      )
    }
  }
}

export function compareJson(originalText, changedText) {
  const originalJson = JSON.parse(originalText)
  const changedJson = JSON.parse(changedText)
  const differences = []

  compareValues(originalJson, changedJson, '$', differences)

  if (differences.length === 0) {
    return '✓ Both are identical'
  }

  return differences.join('\n')
}
