import {useEffect,useState} from 'react'
import {BrowserRouter,Routes,Route,Link,useParams} from 'react-router-dom'
import {Search,Star,Package,ArrowLeft} from 'lucide-react'
import {toolkits} from './toolkits'

const all=toolkits.flatMap(k=>k.tools.map(t=>({...t,kit:k,key:`${k.id}/${t.id}`})))
const useLS=(k)=>{const [v,s]=useState(()=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}});return [v,n=>{s(n);localStorage.setItem(k,JSON.stringify(n))}]}
const pick=(ids)=>ids.map(i=>all.find(t=>t.key===i)).filter(Boolean)
const Chip=({t})=><Link className="chip" to={`/tool/${t.key}`} style={{background:t.kit.color}}><t.kit.icon size={16}/>{t.name}</Link>

function Home(){
  const [q,setQ]=useState(''),[fav]=useLS('fav'),[rec]=useLS('rec')
  const hits=all.filter(t=>(t.name+t.desc+t.kit.name).toLowerCase().includes(q.toLowerCase()))
  return <><section className="hero"><h1>Every little job<br/>has a little tool.</h1>
    <p>Free, private tools that run right in your browser. No sign-up, nothing uploaded.</p>
    <label className="search"><Search size={20}/><input placeholder="Find your tool…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search tools"/></label></section>
    {q?<section><h2>{hits.length} result{hits.length!==1&&'s'}</h2>{hits.length?<div className="chips">{hits.map(t=><Chip key={t.key} t={t}/>)}</div>:<div className="empty">No tool matches “{q}”. Try “json” or “hash”.</div>}</section>:<>
      {fav.length>0&&<section><h2>Favourites</h2><div className="chips">{pick(fav).map(t=><Chip key={t.key} t={t}/>)}</div></section>}
      {rec.length>0&&<section><h2>Recently used</h2><div className="chips">{pick(rec).map(t=><Chip key={t.key} t={t}/>)}</div></section>}
      <section><h2>Toolkits</h2><div className="grid">{toolkits.map(k=><Link key={k.id} to={`/kit/${k.id}`} className="card" style={{background:k.color}}>
        <k.icon size={36}/><h3>{k.name}</h3><p>{k.desc}</p><small>{k.tools.length} tool{k.tools.length>1&&'s'} · open drawer</small></Link>)}</div></section></>}</>}

function Kit(){
  const k=toolkits.find(x=>x.id===useParams().kit)
  if(!k)return <div className="empty">Toolkit not found. <Link to="/">Go home</Link></div>
  return <><Link to="/" className="back"><ArrowLeft size={16}/>Home</Link><h1>{k.name}</h1><p>{k.desc}</p>
    <div className="grid">{k.tools.map(t=><Link key={t.id} to={`/tool/${k.id}/${t.id}`} className="card" style={{background:k.color}}><k.icon size={28}/><h3>{t.name}</h3><p>{t.desc}</p></Link>)}</div></>}

function ToolPage(){
  const {kit,tool}=useParams(),t=all.find(x=>x.key===`${kit}/${tool}`),[fav,setFav]=useLS('fav'),[rec,setRec]=useLS('rec')
  useEffect(()=>{if(t)setRec([t.key,...rec.filter(r=>r!==t.key)].slice(0,6))},[t?.key])
  if(!t)return <div className="empty">Tool not found. <Link to="/">Go home</Link></div>
  const on=fav.includes(t.key)
  return <><div className="crumb"><Link to="/">Home</Link> / <Link to={`/kit/${t.kit.id}`}>{t.kit.name}</Link> / {t.name}</div>
    <div className="titlebar"><h1>{t.name}</h1><button className={'btn'+(on?' on':'')} aria-pressed={on} onClick={()=>setFav(on?fav.filter(f=>f!==t.key):[...fav,t.key])}><Star size={16} fill={on?'currentColor':'none'}/>{on?'Favourited':'Favourite'}</button></div>
    <p>{t.desc}</p><t.component key={t.key}/></>}

export default function App(){
  return <BrowserRouter><header><Link to="/" className="logo"><Package size={24}/>TOOLBOX.</Link><nav><Link to="/">Home</Link>{toolkits.slice(0,3).map(k=><Link key={k.id} to={`/kit/${k.id}`}>{k.name.split(' ')[0]}</Link>)}</nav></header>
    <main><Routes><Route path="/" element={<Home/>}/><Route path="/kit/:kit" element={<Kit/>}/><Route path="/tool/:kit/:tool" element={<ToolPage/>}/></Routes></main>
    <footer>Made with care · everything runs in your browser</footer></BrowserRouter>}
