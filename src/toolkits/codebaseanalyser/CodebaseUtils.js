//convert bytes in B, MB, KB
export const formatBytes = bytes => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

export const download = (blob, name) => { //blob is the actual data and name is the name of the file to be downloaded
  //crate temp link assign the blob to the link add name of the file then add click event ti the link to download the file
    const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name
  link.click()
  //release the url after 1 s 
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

//these are for comment and block comment for each language
const slash = ['//', ['/*', '*/']]
const hash = ['#', null]
const dash = ['--', ['/*', '*/']]
const markup = [null, ['<!--', '-->']]
const none = [null, null]

//language, comments, extensions for each language
const GROUPS = [
  ['JavaScript', slash, 'js jsx mjs cjs'],
  ['TypeScript', slash, 'ts tsx'],
  ['Python', hash, 'py'],
  ['Java', slash, 'java'],
  ['C / C++', slash, 'c h cpp hpp cc'],
  ['C#', slash, 'cs'],
  ['Go', slash, 'go'],
  ['Rust', slash, 'rs'],
  ['PHP', slash, 'php'],
  ['Swift', slash, 'swift'],
  ['Kotlin', slash, 'kt'],
  ['Ruby', hash, 'rb'],
  ['Shell', hash, 'sh bash'],
  ['YAML', hash, 'yml yaml'],
  ['SQL', dash, 'sql'],
  ['HTML', markup, 'html htm'],
  ['XML', markup, 'xml'],
  ['SVG', markup, 'svg'],
  ['CSS', [null, ['/*', '*/']], 'css'],
  ['SCSS', slash, 'scss'],
  ['JSON', none, 'json'],
  ['Markdown', none, 'md'],
  ['Text', none, 'txt'],
  ['CSV', none, 'csv']
]

//easy lookup for language info by extension
const LANGS = {}
for (const [name, [line, block], extensions] of GROUPS) {
    //split the extension 
  for (const extension of extensions.split(' ')) {
    //store the info for each extension in the LANGS object with the extension as the key and an object containing the name, line comment syntax, and block comment syntax as the value
    LANGS[extension] = { name, line, block }
  }
}

const BINARY = new Set(
  'png jpg jpeg gif webp ico bmp pdf zip gz tar rar 7z exe dll so dylib woff woff2 ttf otf eot mp3 mp4 mov avi wav class jar bin'.split(
    ' '
  )
)
const IGNORED = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '__pycache__',
  'venv',
  '.venv',
  '.idea',
  '.vscode',
  'coverage',
  'target'
])

const MAX_BYTES = 2 * 1024 * 1024

//get the file type name  i mean get the extension of the file and return the name of the language or file type based on the extension
export const extOf = name => {
  const index = name.lastIndexOf('.')
  return index > 0 ? name.slice(index + 1).toLowerCase() : ''
}

const looksBinary = async file => {
  const sample = new Uint8Array(await file.slice(0, 4096).arrayBuffer())
  return sample.includes(0)
}

// now count line comments blank line 
export const countLines = (text, spec = {}) => { //text is content of the file and spec is the language spec for the file
  const { line, block } = spec //get the line and block comment syntax for the language
  let code = 0
  let comment = 0
  let blank = 0
  let inBlock = false

  if (!text) {
    return { total: 0, code, comment, blank }
  }

  const lines = text.replace(/\r?\n$/, '').split(/\r?\n/)
  //process each line at a time 
  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim()
    //then it is blank line 
    if (!trimmedLine) {
      blank++
      continue
    }
    //check if the line is in block comment if it is then increment the comment count and 
    //check if the line contains the end of the block comment if it does then set inBlock to false and continue to the next line
    if (inBlock) {
      comment++
      if (trimmedLine.includes(block[1])) inBlock = false
      continue
    }
    //check if the line is a line comment if it is then increment the comment count and continue to the next line
    if (line && trimmedLine.startsWith(line)) {
      comment++
      continue
    }
    //check if the line is a block comment if it is then increment the comment count and check if the line contains the end of the block comment if it does then set inBlock to false and continue to the next line
    if (block && trimmedLine.startsWith(block[0])) {
      comment++
      if (!trimmedLine.slice(block[0].length).includes(block[1])) {
        inBlock = true
      }
      continue
    }

    code++
  }
  //return the total number of lines and the number of code, comment, and blank lines
  return { total: code + comment + blank, code, comment, blank }
}

export const fromInput = files =>
  [...files].map(file => ({
    path: file.webkitRelativePath || file.name,
    file
  }))

const readBatch = reader =>
    //The browser's File and Directory Entries API provides a readEntries() method to read directory contents.
  new Promise((resolve, reject) => reader.readEntries(resolve, reject))


const walk = async (entry, output, skip, skipped) => {
  if (entry.isFile) {
    return new Promise((resolve, reject) => {
      entry.file(
        file => {
          output.push({
            path: entry.fullPath.replace(/^\//, ''),
            file
          })
          resolve()
        },
        reject
      )
    })
  }

  if (skip && IGNORED.has(entry.name)) {
    skipped.push(entry.name)
    return
  }

  const reader = entry.createReader()
  for (;;) {
    const batch = await readBatch(reader)
    if (!batch.length) break
    for (const child of batch) {
      await walk(child, output, skip, skipped)
    }
  }
}


export const collectFromDrop = async (items, skip = true) => {
  // Capture entries before awaiting; browsers may clear the drag data afterward.
  const entries = [...items]
    .map(item => item.webkitGetAsEntry?.())
    .filter(Boolean)
  const list = []
  const skippedDirs = []

  for (const entry of entries) {
    await walk(entry, list, skip, skippedDirs)
  }

  return { list, skippedDirs }
}

export const analyse = async (
  entries,
  { skip = true, skippedDirs = [], onProgress } = {}
) => {
  const ignoredFolders = new Set(skippedDirs)
  let ignoredFiles = 0

  // Also filter input-selected files, since folder input cannot skip directories
  // while the browser is collecting the FileList.
  const keep = entries.filter(({ path }) => {
    if (!skip) return true

    const ignored = path
      .split('/')
      .slice(0, -1)
      .find(part => IGNORED.has(part))

    if (ignored) {
      ignoredFolders.add(ignored)
      ignoredFiles++
      return false
    }

    return true
  })

  const dirs = new Set()
  const types = {}
  const list = []
  const totals = { total: 0, code: 0, comment: 0, blank: 0, size: 0 }
  let maxDepth = 0
  let binary = 0
  let tooLarge = 0

  for (let index = 0; index < keep.length; index++) {
    const { path, file } = keep[index]
    const parts = path.split('/')
    const extension = extOf(file.name)
    const spec = LANGS[extension]

    for (let depth = 1; depth < parts.length; depth++) {
      dirs.add(parts.slice(0, depth).join('/'))
    }
    maxDepth = Math.max(maxDepth, parts.length - 1)

    const key = extension || '(none)'
    const type = types[key] || (types[key] = {
      ext: key,
      name: spec?.name || (extension ? `${extension.toUpperCase()} files` : 'No extension'),
      files: 0,
      total: 0,
      code: 0,
      comment: 0,
      blank: 0,
      size: 0
    })

    type.files++
    type.size += file.size
    totals.size += file.size

    let counts = null
    if (BINARY.has(extension) || (!spec && await looksBinary(file))) {
      binary++
    } else if (file.size > MAX_BYTES) {
      tooLarge++
    } else {
      counts = countLines(await file.text(), spec)
      for (const key of ['total', 'code', 'comment', 'blank']) {
        type[key] += counts[key]
        totals[key] += counts[key]
      }
    }

    list.push({
      path,
      size: file.size,
      lines: counts ? counts.total : 0
    })

    if (index % 25 === 0) {
      onProgress?.(index + 1, keep.length)
      await new Promise(resolve => setTimeout(resolve))
    }
  }

  return {
    root: keep[0]?.path.split('/')[0] || '',
    files: keep.length,
    folders: dirs.size,
    maxDepth,
    ...totals,
    binary,
    tooLarge,
    ignored: {
      files: ignoredFiles,
      folders: [...ignoredFolders]
    },
    types: Object.values(types).sort(
      (a, b) => b.files - a.files || b.total - a.total
    ),
    largest: [...list].sort((a, b) => b.size - a.size).slice(0, 5),
    longest: [...list]
      .sort((a, b) => b.lines - a.lines)
      .slice(0, 5)
      .filter(file => file.lines)
  }
}

export const toCSV = result =>
  [
    'type,language,files,lines,code,comment,blank,bytes',
    ...result.types.map(type =>
      [
        type.ext,
        `"${type.name}"`,
        type.files,
        type.total,
        type.code,
        type.comment,
        type.blank,
        type.size
      ].join(',')
    )
  ].join('\n')
