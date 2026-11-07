// Build topics: SQL syntax and formatting, CSV parsing, SQL identifiers and
// literal escaping, comment removal, and composing tools with React props.
import {Database} from 'lucide-react'
import {format} from 'sql-formatter'
import Papa from 'papaparse'
import TextTool from '../components/TextTool'

const S='select id,name from users where age>18 and city=\'Pune\' order by name'

export const sql={id:'sql',name:'SQL Toolkit',desc:'Format, shrink and generate SQL.',color:'#bdb2ff',icon:Database,tools:[
 {id:'formatter',name:'SQL Formatter',desc:'Make queries easy to read.',component:()=><TextTool file="query.sql" sample={[S]} modes={[{label:'Format',run:([s])=>format(s,{keywordCase:'upper'})}]}/>},
 {id:'minifier',name:'SQL Minifier',desc:'Remove comments and extra spaces.',component:()=><TextTool file="min.sql" sample={['-- users\nSELECT *\n  FROM users\n WHERE id = 1;']} modes={[{label:'Minify',run:([s])=>s.replace(/--.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').trim()}]}/>},
 {id:'insert',name:'SQL INSERT Generator',desc:'Turn CSV rows into INSERT statements.',component:()=><TextTool file="inserts.sql" fields={['Table name','CSV (first row = column names)']} sample={['users','id,name,city\n1,Asha,Pune\n2,O\'Neil,']} modes={[{label:'Generate',run:([t,c])=>{const r=Papa.parse(c.trim(),{header:true,skipEmptyLines:true});const cols=r.meta.fields||[];if(!cols.length)throw new Error('Add a CSV with a header row.');return r.data.map(row=>`INSERT INTO ${t||'my_table'} (${cols.join(', ')}) VALUES (${cols.map(k=>!row[k]?'NULL':isNaN(+row[k])?`'${row[k].replace(/'/g,"''")}'`:row[k]).join(', ')});`).join('\n')}}]}/>}]}
