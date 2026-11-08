# Papa Parse – Notes

## 1. What is Papa Parse?

Papa Parse is a JavaScript library used to parse CSV data and convert JavaScript data into CSV format.

Install:

```bash
npm install papaparse
```

Import:

```js
import Papa from 'papaparse'
```

## 2. Important Methods

### Papa.parse()

Converts CSV text into JavaScript data.

```js
const result = Papa.parse(csvText, {
  header: true,
  skipEmptyLines: true
})
```

- `header: true` – Treats the first row as column names and creates objects.
- `skipEmptyLines: true` – Ignores empty rows.
- `result.data` – Contains the parsed data.
- `result.errors` – Contains parsing errors.
- `result.meta` – Contains metadata about the parsed CSV.

Example:

Input:

```csv
name,city
Asha,Pune
Ravi,Delhi
```

Output (`result.data`):

```js
[
  { name: 'Asha', city: 'Pune' },
  { name: 'Ravi', city: 'Delhi' }
]
```

### Papa.unparse()

Converts JavaScript data into CSV text.

```js
const csvText = Papa.unparse(jsonData)
```

Example:

Input:

```js
[
  { name: 'Asha', city: 'Pune' },
  { name: 'Ravi', city: 'Delhi' }
]
```

Output:

```csv
name,city
Asha,Pune
Ravi,Delhi
```

## 3. Common CSV Conversion Flow

**CSV to JSON**

1. Receive CSV text.
2. Use `Papa.parse()` to convert it into JavaScript data.
3. Access the converted data using `result.data`.
4. Use `JSON.stringify()` to convert JavaScript data into a JSON string.

**JSON to CSV**

1. Receive JSON text.
2. Use `JSON.parse()` to convert it into JavaScript data.
3. Use `Papa.unparse()` to convert the data into CSV text.

## 4. Important JavaScript Methods Used Alongside Papa Parse

| Method | Purpose |
|---|---|
| `JSON.parse()` | JSON string → JavaScript value |
| `JSON.stringify()` | JavaScript value → JSON string |
| `.trim()` | Removes whitespace from both ends of a string |
| `Array.isArray()` | Checks whether a value is an array |
| `throw new Error()` | Throws an error when validation fails |

## 5. Important Difference

- `Papa.parse()` is used for reading/parsing CSV.
- `Papa.unparse()` is used for generating CSV.
- `JSON.parse()` and `JSON.stringify()` are JavaScript methods, not Papa Parse methods.

## 6. Official Documentation

https://www.papaparse.com/