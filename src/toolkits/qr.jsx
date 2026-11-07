// Build topics: QR-code encoding, URL/text and Wi-Fi payload formats,
// React state/effects, async generation, data URLs, SVG/PNG downloads,
// and accessible form controls.
import { useEffect, useState } from 'react'
import { QrCode, Download } from 'lucide-react'
import QRCode from 'qrcode'

function QrTool() {
  const [kind, setKind] = useState('url')
  const [text, setText] = useState('https://example.com')
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [foreground, setForeground] = useState('#3b2f2f')
  const [background, setBackground] = useState('#ffffff')
  const [png, setPng] = useState('')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  // Wi-Fi QR payloads follow the WIFI: format; other types encode the given text.
  const data = kind === 'wifi'
    ? `WIFI:T:WPA;S:${ssid};P:${password};;`
    : text

  useEffect(() => {
    if (!data.trim() || (kind === 'wifi' && !ssid)) {
      setPng('')
      return
    }

    const options = {
      color: { dark: foreground, light: background },
      margin: 2,
      width: 360
    }

    // Generate both download formats together so their preview data stays in sync.
    Promise.all([
      QRCode.toDataURL(data, options),
      QRCode.toString(data, { ...options, type: 'svg' })
    ])
      .then(([pngData, svgData]) => {
        setPng(pngData)
        setSvg(svgData)
        setError('')
      })
      .catch(generationError => setError(generationError.message))
  }, [data, foreground, background, kind, ssid])

  return (
    <div className="work">
      <div className="col">
        <label className="field">
          <span>Type</span>
          <select
            value={kind}
            onChange={event => setKind(event.target.value)}
          >
            <option value="url">URL</option>
            <option value="text">Text</option>
            <option value="wifi">Wi-Fi</option>
          </select>
        </label>

        {kind === 'wifi' ? (
          <>
            <label className="field">
              <span>Network name</span>
              <input
                value={ssid}
                onChange={event => setSsid(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </label>
          </>
        ) : (
          <label className="field">
            <span>{kind === 'url' ? 'Link' : 'Text'}</span>
            <textarea
              rows={4}
              value={text}
              onChange={event => setText(event.target.value)}
            />
          </label>
        )}

        <div className="row">
          <label className="field">
            <span>Ink</span>
            <input
              type="color"
              value={foreground}
              onChange={event => setForeground(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Paper</span>
            <input
              type="color"
              value={background}
              onChange={event => setBackground(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="col">
        <span className="lbl">Preview</span>
        {error ? (
          <div className="err">⚠ {error}</div>
        ) : png ? (
          <>
            <img src={png} alt="QR code" className="qr" />
            <div className="row">
              <a className="btn main" href={png} download="qr.png">
                <Download size={16} />
                PNG
              </a>
              <a
                className="btn"
                href={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                download="qr.svg"
              >
                <Download size={16} />
                SVG
              </a>
            </div>
          </>
        ) : (
          <div className="empty">
            Fill in the details to see your QR code.
          </div>
        )}
      </div>
    </div>
  )
}

export const qr = {
  id: 'qr',
  name: 'QR Generator',
  desc: 'URL, text and Wi-Fi QR codes.',
  color: '#ffc6ff',
  icon: QrCode,
  tools: [
    {
      id: 'qr-code',
      name: 'QR Code Generator',
      desc: 'Make a QR code with your own colours.',
      component: QrTool
    }
  ]
}
