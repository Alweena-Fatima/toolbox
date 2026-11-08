# Markdown Editor Toolkit – Technical Notes



### 1.1 Lucide React

**Definition:** Lucide React is an icon library that provides reusable SVG icons as React components.

**How it is used:**
- `Copy` – Copy button.
- `Download` – Download button.
- `Eraser` – Clear button.
- `FileCode` – HTML export button.
- `FileText` – Markdown toolkit icon.
- `Check` – Indicates successful copying.
- `FlaskConical` – Sample button.

**Example:**
```jsx
import { Download } from 'lucide-react'

<Download size={16} />
```

### 1.2 Marked

**Definition:** Marked is a JavaScript Markdown parser that converts Markdown text into HTML.

**Purpose:** Converts Markdown syntax into browser-renderable HTML.

**Example:**

Input:
```markdown
# Hello World

This is **bold** text.
```

Output:
```html
<h1>Hello World</h1>
<p>This is <strong>bold</strong> text.</p>
```

**Usage:**
```jsx
marked.parse(source, {
  gfm: true,
  breaks: true
})
```

Important options:
- `gfm: true` – Enables GitHub Flavored Markdown, supporting tables, task lists, strikethrough and other extensions.
- `breaks: true` – Converts ordinary line breaks into HTML line breaks.

### 1.3 DOMPurify

**Definition:** DOMPurify is an HTML sanitization library used to remove potentially dangerous HTML elements and attributes.

**Purpose:** Protects the application against Cross-Site Scripting (XSS) when rendering user-generated HTML.

**Why needed?**

A user might enter malicious HTML containing JavaScript event handlers or unsafe elements.

**Usage:**
```jsx
DOMPurify.sanitize(markup)
```

It sanitizes the generated HTML before inserting it into the preview.

**Important:** Markdown parsing and HTML sanitization are different operations. Marked converts Markdown into HTML; DOMPurify sanitizes that HTML.

---

### 3.2 useState

**Definition:** A React Hook used to store and update component state.

**Syntax:**
```jsx
const [state, setState] = useState(initialValue)
```

Used in this toolkit:

```jsx
const [source, setSource] = useState(sampleMarkdown)

const [isCopied, setIsCopied] = useState(false)

const [error, setError] = useState('')
```

Purpose:
- `source` – Stores Markdown content.
- `isCopied` – Tracks clipboard copy status.
- `error` – Stores error messages.

Calling the setter updates state and triggers a re-render.

### 3.3 useMemo

**Definition:** A React Hook that caches the result of a calculation between renders.

**Syntax:**
```jsx
const result = useMemo(() => {
  return calculateSomething()
}, [dependency])
```

Used in this toolkit:

```jsx
const html = useMemo(
  () => renderMarkdown(source),
  [source]
)
```

Purpose:
- Converts Markdown into HTML.
- Recalculates when `source` changes.
- Avoids repeating the calculation when dependencies remain unchanged.


### 5.1 File API

**Definition:** Provides functionality to access and read files selected by users.

Used in:
```javascript
selectedFile.text()
```

Purpose: Read the content of an uploaded Markdown or text file.

### 5.2 Blob API

**Definition:** Blob (Binary Large Object) represents immutable raw file-like data.

Used in:
```javascript
const blob = new Blob([content], {
  type: 'text/markdown'
})
```

Purpose: Create downloadable file data directly in the browser.

### 5.3 URL API

**Definition:** Provides methods to create and manage URLs.

**createObjectURL():**
```javascript
URL.createObjectURL(blob)
```
Creates a temporary URL pointing to a Blob.

**revokeObjectURL():**
```javascript
URL.revokeObjectURL(downloadUrl)
```
Releases the temporary URL when it is no longer needed.

### 5.4 DOM API

**Definition:** The Document Object Model (DOM) represents an HTML document as a tree of objects that JavaScript can access and modify.

Used in:
```javascript
document.createElement('a')
```

Purpose: Dynamically create an anchor element to trigger file downloads.

### 5.5 Clipboard API

**Definition:** Provides browser functionality to read and write clipboard data, subject to browser permissions and security requirements.

Used in:
```javascript
navigator.clipboard.writeText(source)
```

Purpose: Copy Markdown content to the user's clipboard.

### 5.6 DOMPurify and HTML Injection

Used in:
```jsx
dangerouslySetInnerHTML={{
  __html: html
}}
```

Purpose: Render an HTML string as actual HTML inside a React element.

**Security consideration:** Never insert untrusted HTML directly. Sanitize it before rendering.

---

## 6. File Handling and Download Concepts

### MIME Type

**Definition:** A MIME type identifies the format of a file or data.

Examples:

| MIME Type | Format |
|---|---|
| `text/plain` | TXT |
| `text/html` | HTML |
| `text/markdown` | Markdown |
| `application/json` | JSON |
| `text/csv` | CSV |

### File Download Flow

1. Create a Blob containing the content.
2. Generate a temporary URL using `URL.createObjectURL()`.
3. Create an anchor element.
4. Assign the URL to its `href`.
5. Set the desired filename using the `download` attribute.
6. Trigger the click programmatically.
7. Revoke the temporary URL.

---

## 7. Markdown Basics

Markdown is a lightweight markup language used to format plain text.

| Syntax | Output |
|---|---|
| `# Heading 1` | Main heading |
| `## Heading 2` | Subheading |
| `**Bold**` | **Bold** |
| `*Italic*` | *Italic* |
| `` `code` `` | Inline code |
| `- Item` | Unordered list |
| `1. Item` | Ordered list |
| `~~Text~~` | ~~Strikethrough~~ |
| `> Quote` | Blockquote |
| `[Google](https://google.com)` | Hyperlink |
| `![Alt](image.png)` | Image |
| `- [x] Task` | Completed task |
| `- [ ] Task` | Incomplete task |

---
