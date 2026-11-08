import { useMemo, useState } from 'react' //Used to cache the result of an expensive calculation.

import {
  Check,
  Copy,
  Download,
  Eraser,
  FileCode,
  FileText,
  FlaskConical
} from 'lucide-react'
import DOMPurify from 'dompurify' //DOMPurify removes unsafe HTML elements and attributes.
import { marked } from 'marked' //A parser converts text written in one format into another format.
// Input:
// # Hello
// **Welcome**

// Output:
// <h1>Hello</h1>
// <p><strong>Welcome</strong></p>

const sampleMarkdown = `# Hello, Toolbox!

Some **bold**, _italic_ and \`inline code\`.

- [x] Write markdown
- [ ] Export it

| Tool | Cute? |
|------|-------|
| Markdown | yes |

~~strikethrough~~ and https://example.com

> Small tools, big help.`


//It converts Markdown text into safe HTML.
function renderMarkdown(source) {
  //take source and convert it into html using marked library. gfm means github flavored markdown and breaks means line breaks are converted to <br> tags.
  const renderedMarkdown = marked.parse(source, {
    gfm: true,
    breaks: true
  })
  //if renderedMarkdown is string then return it else convert it into string
  const markup = typeof renderedMarkdown === 'string'
    ? renderedMarkdown
    : String(renderedMarkdown)

  // Sanitize rendered markup before inserting it into the preview.
  return DOMPurify.sanitize(markup)
}

//Count the number of word s
function countWords(source) {
  //remove whitepsace 
  const trimmedSource = source.trim()

  if (!trimmedSource) {
    return 0
  }
  //sprilt and count the number of words
  return trimmedSource.split(/\s+/).length
}

//download the file directly without saving it to server
function saveFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType }) //blob is binary large object In simple words, it represents raw file data in the browser.
  const downloadUrl = URL.createObjectURL(blob) //this create a temporary url for blob object which can be used to download the file directly without saving it to server.
  //create a link then set href to download url and set download attribute to file name then click the link to download the file
  const link = document.createElement('a')

  link.href = downloadUrl
  link.download = fileName
  link.click()

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000) //now release the temp url after 1 sec to free memory.
}

//put markup in html document and return it
function createHtmlDocument(markup) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Document</title>
</head>
<body>
${markup}
</body>
</html>`
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function MarkdownEditorTool() {
  const [source, setSource] = useState(sampleMarkdown)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState('')
const html = useMemo(() => renderMarkdown(source), [source])
//   This means:
// - Convert Markdown into HTML.
// - Remember the generated HTML.
// - Recalculate only when source changes.
// Why?

// Because we don't want to unnecessarily convert the same Markdown text into HTML on every render.
  
  const wordCount = countWords(source)

  function handleSourceChange(event) {
    setSource(event.target.value)
    setError('')
  }

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] //file uploaded by the user 

    if (!selectedFile) {
      return
    }

    try {
      const fileText = await selectedFile.text() //selectedFile.text() reads the content of the uploaded file.
      //we promise return fileText after reading the selected file we set that file as source 
      setSource(fileText)
      setError('')
    } catch (fileError) {
      setError(getErrorMessage(fileError))
    }
  }

  function handleDownloadMarkdown() {
    saveFile(source, 'document.md', 'text/markdown')
  }

  function handleExportHtml() {
    const htmlDocument = createHtmlDocument(html)
    saveFile(htmlDocument, 'document.html', 'text/html')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(source)
      setIsCopied(true)
      setError('')
      setTimeout(() => setIsCopied(false), 1200)
    } catch (copyError) {
      setError(getErrorMessage(copyError))
    }
  }

  function handleLoadSample() {
    setSource(sampleMarkdown)
    setError('')
  }

  function handleClear() {
    setSource('')
    setError('')
  }

  return (
    <div className="work">
      <div className="col">
        <label className="field">
          <span>Markdown · {wordCount} words</span>
          <textarea
            rows={20}
            value={source}
            spellCheck={false}
            onChange={handleSourceChange}
          />
          <input
            type="file"
            accept=".md,.markdown,.txt"
            aria-label="Open a markdown file"
            onChange={handleFileChange}
          />
        </label>

        <div className="row">
          <button
            className="btn main"
            onClick={handleDownloadMarkdown}
            disabled={!source}
          >
            <Download size={16} />
            Download .md
          </button>
          <button
            className="btn"
            onClick={handleExportHtml}
            disabled={!source}
          >
            <FileCode size={16} />
            Export HTML
          </button>
          <button className="btn" onClick={handleCopy} disabled={!source}>
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copied' : 'Copy'}
          </button>
          <button className="btn" onClick={handleLoadSample}>
            <FlaskConical size={16} />
            Sample
          </button>
          <button className="btn" onClick={handleClear}>
            <Eraser size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="col">
        <span className="lbl">Live preview</span>
        {error && (
          <div className="err" role="alert">
            ⚠ {error}
          </div>
        )}
        {source.trim() ? (
          <div
            className="preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="empty">
            Start typing and your preview shows up here.
          </div>
        )}
      </div>
    </div>
  )
}

export const markdown = {
  id: 'markdown',
  name: 'Markdown Editor',
  desc: 'Write markdown with a live preview.',
  color: '#fdffb6',
  icon: FileText,
  tools: [
    {
      id: 'editor',
      name: 'Markdown Editor',
      desc: 'Live preview, GitHub-style markdown, .md download and HTML export.',
      component: MarkdownEditorTool
    }
  ]
}
