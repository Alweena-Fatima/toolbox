// Build topics: QR-code encoding, URL/text and Wi-Fi payload formats,
// React state/effects, async generation, data URLs, SVG/PNG downloads,
// and accessible form controls.
import {useEffect,useState} from 'react'
import {QrCode,Download} from 'lucide-react'
import QRCode from 'qrcode'

function QrTool(){
  const [kind,setKind]=useState('url'),[text,setText]=useState('https://example.com'),[ssid,setSsid]=useState(''),[pw,setPw]=useState('')
  const [fg,setFg]=useState('#3b2f2f'),[bg,setBg]=useState('#ffffff'),[png,setPng]=useState(''),[svg,setSvg]=useState(''),[err,setErr]=useState('')
  const data=kind==='wifi'?`WIFI:T:WPA;S:${ssid};P:${pw};;`:text
  useEffect(()=>{if(!data.trim()||(kind==='wifi'&&!ssid)){setPng('');return}
    const o={color:{dark:fg,light:bg},margin:2,width:360}
    Promise.all([QRCode.toDataURL(data,o),QRCode.toString(data,{...o,type:'svg'})]).then(([p,s])=>{setPng(p);setSvg(s);setErr('')}).catch(e=>setErr(e.message))},[data,fg,bg,kind,ssid])
  return <div className="work"><div className="col">
    <label className="field"><span>Type</span><select value={kind} onChange={e=>setKind(e.target.value)}><option value="url">URL</option><option value="text">Text</option><option value="wifi">Wi-Fi</option></select></label>
    {kind==='wifi'?<><label className="field"><span>Network name</span><input value={ssid} onChange={e=>setSsid(e.target.value)}/></label><label className="field"><span>Password</span><input value={pw} onChange={e=>setPw(e.target.value)}/></label></>
      :<label className="field"><span>{kind==='url'?'Link':'Text'}</span><textarea rows={4} value={text} onChange={e=>setText(e.target.value)}/></label>}
    <div className="row"><label className="field"><span>Ink</span><input type="color" value={fg} onChange={e=>setFg(e.target.value)}/></label><label className="field"><span>Paper</span><input type="color" value={bg} onChange={e=>setBg(e.target.value)}/></label></div></div>
    <div className="col"><span className="lbl">Preview</span>{err?<div className="err">⚠ {err}</div>:png?<><img src={png} alt="QR code" className="qr"/>
      <div className="row"><a className="btn main" href={png} download="qr.png"><Download size={16}/>PNG</a><a className="btn" href={'data:image/svg+xml;utf8,'+encodeURIComponent(svg)} download="qr.svg"><Download size={16}/>SVG</a></div></>
      :<div className="empty">Fill in the details to see your QR code.</div>}</div></div>}

export const qr={id:'qr',name:'QR Generator',desc:'URL, text and Wi-Fi QR codes.',color:'#ffc6ff',icon:QrCode,tools:[
 {id:'qr-code',name:'QR Code Generator',desc:'Make a QR code with your own colours.',component:QrTool}]}
