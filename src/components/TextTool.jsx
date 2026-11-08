import { useState } from 'react'
import { Eraser, FlaskConical } from 'lucide-react'
import OutputPanel from './OutputPanel'

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export default function TextTool({
  fields = ['Input'],
  file = 'output.txt',
  sample,
  onConvert,
  buttonLabel = 'Convert',
  actions = []
}) {
  const [inputs, setInputs] = useState(() => fields.map(() => ''))
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  let availableActions = actions
  if (actions.length === 0) {
    availableActions = [{ label: buttonLabel, onConvert }]
  }

  async function handleConvert(convertFunction) {
    if (typeof convertFunction !== 'function') {
      setError('This tool does not have a conversion function.')
      return
    }

    setIsBusy(true)
    setError('')

    try {
      const result = await convertFunction(inputs)
      setOutput(result == null ? '' : String(result))
    } catch (conversionError) {
      setOutput('')
      setError(getErrorMessage(conversionError))
    } finally {
      setIsBusy(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1200)
    } catch (copyError) {
      setError(getErrorMessage(copyError))
    }
  }

  function handleDownload() {
    const blob = new Blob([output])
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = file
    link.click()

    // Release the temporary browser URL after the download has started.
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  function handleInputChange(inputIndex, value) {
    const updatedInputs = inputs.slice()
    updatedInputs[inputIndex] = value
    setInputs(updatedInputs)
  }

  async function handleFileChange(inputIndex, event) {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    try {
      const fileText = await selectedFile.text()
      handleInputChange(inputIndex, fileText)
      setError('')
    } catch (fileError) {
      setError(getErrorMessage(fileError))
    }
  }

  function handleLoadSample() {
    const sampleInputs = []

    for (let index = 0; index < fields.length; index++) {
      sampleInputs.push(sample[index] || '')
    }

    setInputs(sampleInputs)
    setOutput('')
    setError('')
  }

  function handleClear() {
    setInputs(fields.map(() => ''))
    setOutput('')
    setError('')
    setIsCopied(false)
  }

  return (
    <div className="work">
      <div className="col">
        {fields.map((field, index) => (
          <label key={field} className="field">
            <span>{field}</span>
            <textarea
              rows={fields.length > 1 ? 6 : 14}
              value={inputs[index]}
              spellCheck={false}
              onChange={event =>
                handleInputChange(index, event.target.value)
              }
            />
            <input
              type="file"
              aria-label={`Load file into ${field}`}
              onChange={event => handleFileChange(index, event)}
            />
          </label>
        ))}

        <div className="row">
          {availableActions.map(action => (
            <button
              key={action.label}
              className="btn main"
              onClick={() => handleConvert(action.onConvert)}
              disabled={isBusy}
            >
              {action.label}
            </button>
          ))}

          {sample && (
            <button className="btn" onClick={handleLoadSample}>
              <FlaskConical size={16} />
              Sample
            </button>
          )}

          <button className="btn" onClick={handleClear}>
            <Eraser size={16} />
            Clear
          </button>
        </div>
      </div>

      <OutputPanel
        output={output}
        error={error}
        isCopied={isCopied}
        onCopy={handleCopy}
        onDownload={handleDownload}
      />
    </div>
  )
}
