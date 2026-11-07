import { Check, Copy, Download } from 'lucide-react'

export default function OutputPanel({
  output,
  error,
  isCopied,
  onCopy,
  onDownload
}) {
  return (
    <div className="col">
      <label className="field">
        <span>Output</span>
        {error ? (
          <div className="err" role="alert">
            ⚠ {error}
          </div>
        ) : output ? (
          <textarea readOnly rows={14} value={output} />
        ) : (
          <div className="empty">
            Nothing here yet. Add some input and press a button.
          </div>
        )}
      </label>

      {output && (
        <div className="row">
          <button className="btn" onClick={onCopy}>
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? 'Copied' : 'Copy'}
          </button>
          <button className="btn" onClick={onDownload}>
            <Download size={16} />
            Download
          </button>
        </div>
      )}
    </div>
  )
}
