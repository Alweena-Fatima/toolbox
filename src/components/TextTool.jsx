
import { useState } from 'react'
import { Copy, Download, Eraser, FlaskConical, Check } from 'lucide-react'

export default function TextTool({
  fields = ['Input'],
  modes,
  sample,
  file = 'output.txt'
}) {
  const [v, setV] = useState(fields.map(() => ''))
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)

  const go = async (m) => {
    setBusy(true)
    try {
      setOut(await m.run(v))
      setErr('')
    } catch (e) {
      setOut('')
      setErr(e?.message || String(e))
    }
    setBusy(false)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(out)
    setOk(true)
    setTimeout(() => setOk(false), 1200)
  }

  const save = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([out]))
    a.download = file
    a.click()
  }

  const upload = (i, f) => {
    if (f) {
      f.text().then(t =>
        setV(v.map((x, j) => j === i ? t : x))
      )
    }
  }

  return (
    <div className="work">
      <div className="col">
        {fields.map((f, i) => (
          <label key={i} className="field">
            <span>{f}</span>

            <textarea
              rows={fields.length > 1 ? 6 : 14}
              value={v[i]}
              spellCheck={false}
              onChange={e =>
                setV(v.map((x, j) =>
                  j === i ? e.target.value : x
                ))
              }
            />

            <input
              type="file"
              aria-label={`Load file into ${f}`}
              onChange={e => upload(i, e.target.files?.[0])}
            />
          </label>
        ))}

        <div className="row">
          {modes.map(m => (
            <button
              key={m.label}
              className="btn main"
              onClick={() => go(m)}
              disabled={busy}
            >
              {m.label}
            </button>
          ))}

          {sample && (
            <button className="btn" onClick={() => setV(sample)}>
              <FlaskConical size={16} />
              Sample
            </button>
          )}

          <button
            className="btn"
            onClick={() => {
              setV(fields.map(() => ''))
              setOut('')
              setErr('')
            }}
          >
            <Eraser size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="col">
        <label className="field">
          <span>Output</span>

          {err ? (
            <div className="err" role="alert">
              ⚠ {err}
            </div>
          ) : out ? (
            <textarea readOnly rows={14} value={out} />
          ) : (
            <div className="empty">
              Nothing here yet. Add some input and press a button.
            </div>
          )}
        </label>

        {out && (
          <div className="row">
            <button className="btn" onClick={copy}>
              {ok ? <Check size={16} /> : <Copy size={16} />}
              {ok ? 'Copied' : 'Copy'}
            </button>

            <button className="btn" onClick={save}>
              <Download size={16} />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
