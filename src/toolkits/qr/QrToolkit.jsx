import { useEffect, useState } from 'react'
import { Download, QrCode } from 'lucide-react'
import { generateQrFiles } from './qrUtils'

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function QrTool() {
  const [kind, setKind] = useState('url')
  const [text, setText] = useState('https://example.com')
  const [networkName, setNetworkName] = useState('')
  const [password, setPassword] = useState('')
  const [foreground, setForeground] = useState('#3b2f2f')
  const [background, setBackground] = useState('#ffffff')
  const [png, setPng] = useState('')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  let data = text
  if (kind === 'wifi') {
    // Wi-Fi QR readers recognize this payload format.
    data = `WIFI:T:WPA;S:${networkName};P:${password};;`
  }

  useEffect(() => {
    let isCurrentRequest = true

    async function updateQrCode() {
      if (!data.trim() || (kind === 'wifi' && !networkName)) {
        setPng('')
        setSvg('')
        setError('')
        return
      }

      try {
        const files = await generateQrFiles(data, foreground, background)

        if (isCurrentRequest) {
          setPng(files.png)
          setSvg(files.svg)
          setError('')
        }
      } catch (generationError) {
        if (isCurrentRequest) {
          setPng('')
          setSvg('')
          setError(getErrorMessage(generationError))
        }
      }
    }

    updateQrCode()

    // Ignore an old response if the user has already changed the input.
    return () => {
      isCurrentRequest = false
    }
  }, [data, foreground, background, kind, networkName])

  function handleKindChange(event) {
    setKind(event.target.value)
  }

  function handleTextChange(event) {
    setText(event.target.value)
  }

  function handleNetworkNameChange(event) {
    setNetworkName(event.target.value)
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value)
  }

  function handleForegroundChange(event) {
    setForeground(event.target.value)
  }

  function handleBackgroundChange(event) {
    setBackground(event.target.value)
  }

  return (
    <div className="work">
      <div className="col">
        <label className="field">
          <span>Type</span>
          <select value={kind} onChange={handleKindChange}>
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
                value={networkName}
                onChange={handleNetworkNameChange}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input value={password} onChange={handlePasswordChange} />
            </label>
          </>
        ) : (
          <label className="field">
            <span>{kind === 'url' ? 'Link' : 'Text'}</span>
            <textarea
              rows={4}
              value={text}
              onChange={handleTextChange}
            />
          </label>
        )}

        <div className="row">
          <label className="field">
            <span>Ink</span>
            <input
              type="color"
              value={foreground}
              onChange={handleForegroundChange}
            />
          </label>
          <label className="field">
            <span>Paper</span>
            <input
              type="color"
              value={background}
              onChange={handleBackgroundChange}
            />
          </label>
        </div>
      </div>

      <div className="col">
        <span className="lbl">Preview</span>
        {error ? (
          <div className="err" role="alert">
            ⚠ {error}
          </div>
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
