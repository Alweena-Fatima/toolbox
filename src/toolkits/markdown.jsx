// Build topics: Markdown/CommonMark and GFM, React state/memoization,
// HTML sanitization, browser file and clipboard APIs, and Blob downloads.
import { useMemo, useState } from 'react'
import {
  FileText,
  Download,
  FileCode,
  Copy,
  Check,
  Eraser,
  FlaskConical
} from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const SAMPLE = `# Hello, Toolbox!

Some **bold**, _italic_ and \`inline code\`.

- [x] Write markdown
- [ ] Export it

| Tool | Cute? |
|------|-------|
| Markdown | yes |

~~strikethrough~~ and https://example.com

> Small tools, big help.`

const save = (content, name, type) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type }))
  link.download = name
  link.click()

  // Release the temporary object URL after the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

function MdEditor() {
  const [source, setSource] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)

  // Sanitize rendered markup before inserting it into the preview.
  const html = useMemo(() => {
    const rendered = marked.parse(source, { gfm: true, breaks: true })
    const markup = typeof rendered === 'string' ? rendered : String(rendered)

    return DOMPurify.sanitize(markup)
  }, [source])

  const wordCount = source.trim()
    ? source.trim().split(/\s+/).length
    : 0

  const copy = async () => {
    await navigator.clipboard.writeText(source)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const exportHtml = () => {
    const documentHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Document</title></head>
<body>
${html}
</body></html>`

    save(documentHtml, 'document.html', 'text/html')
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
            onChange={event => setSource(event.target.value)}
          />
          <input
            type="file"
            accept=".md,.markdown,.txt"
            aria-label="Open a markdown file"
            onChange={event => {
              const file = event.target.files?.[0]
              if (file) file.text().then(setSource)
            }}
          />
        </label>

        <div className="row">
          <button
            className="btn main"
            onClick={() => save(source, 'document.md', 'text/markdown')}
            disabled={!source}
          >
            <Download size={16} />
            Download .md
          </button>
          <button
            className="btn"
            onClick={exportHtml}
            disabled={!source}
          >
            <FileCode size={16} />
            Export HTML
          </button>
          <button className="btn" onClick={copy} disabled={!source}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="btn" onClick={() => setSource(SAMPLE)}>
            <FlaskConical size={16} />
            Sample
          </button>
          <button className="btn" onClick={() => setSource('')}>
            <Eraser size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="col">
        <span className="lbl">Live preview</span>
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
      component: MdEditor
    }
  ]
}
