// Build topics: Markdown/CommonMark and GFM, React state/memoization,
// HTML sanitization, browser file and clipboard APIs, and Blob downloads.
import {useMemo,useState} from 'react'
import {FileText,Download,FileCode,Copy,Check,Eraser,FlaskConical} from 'lucide-react'
import {marked} from 'marked'
import DOMPurify from 'dompurify'

const SAMPLE=`# Hello, Toolbox!

Some **bold**, _italic_ and \`inline code\`.

- [x] Write markdown
- [ ] Export it

| Tool | Cute? |
|------|-------|
| Markdown | yes |

~~strikethrough~~ and https://example.com

> Small tools, big help.`

const save=(content,name,type)=>{
  const a=document.createElement('a')
  a.href=URL.createObjectURL(new Blob([content],{type}))
  a.download=name;a.click()
  setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function MdEditor(){
  const [src,setSrc]=useState(SAMPLE),[ok,setOk]=useState(false)
  // GitHub-flavoured markdown (tables, task lists, strikethrough); output is sanitised
  const html=useMemo(()=>{
    const rendered = marked.parse(src,{gfm:true,breaks:true})
    return DOMPurify.sanitize(typeof rendered === 'string' ? rendered : String(rendered))
  },[src])
  const words=src.trim()?src.trim().split(/\s+/).length:0
  const copy=async()=>{await navigator.clipboard.writeText(src);setOk(true);setTimeout(()=>setOk(false),1200)}
  const exportHtml=()=>save(`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Document</title></head>\n<body>\n${html}\n</body></html>`,'document.html','text/html')
  return <div className="work">
    <div className="col">
      <label className="field"><span>Markdown · {words} words</span>
        <textarea rows={20} value={src} spellCheck={false} onChange={e=>setSrc(e.target.value)}/>
        <input type="file" accept=".md,.markdown,.txt" aria-label="Open a markdown file" onChange={e=>e.target.files?.[0]?.text().then(setSrc)}/></label>
      <div className="row">
        <button className="btn main" onClick={()=>save(src,'document.md','text/markdown')} disabled={!src}><Download size={16}/>Download .md</button>
        <button className="btn" onClick={exportHtml} disabled={!src}><FileCode size={16}/>Export HTML</button>
        <button className="btn" onClick={copy} disabled={!src}>{ok?<Check size={16}/>:<Copy size={16}/>}{ok?'Copied':'Copy'}</button>
        <button className="btn" onClick={()=>setSrc(SAMPLE)}><FlaskConical size={16}/>Sample</button>
        <button className="btn" onClick={()=>setSrc('')}><Eraser size={16}/>Clear</button></div></div>
    <div className="col"><span className="lbl">Live preview</span>
      {src.trim()?<div className="preview" dangerouslySetInnerHTML={{__html:html}}/>:<div className="empty">Start typing and your preview shows up here.</div>}</div></div>}

export const markdown={id:'markdown',name:'Markdown Editor',desc:'Write markdown with a live preview.',color:'#fdffb6',icon:FileText,tools:[
 {id:'editor',name:'Markdown Editor',desc:'Live preview, GitHub-style markdown, .md download and HTML export.',component:MdEditor}]}