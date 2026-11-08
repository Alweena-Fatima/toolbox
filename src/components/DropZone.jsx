import { useRef, useState } from 'react'
import { Minus, MinusCircle, Plus, PlusIcon } from 'lucide-react'

export default function DropZone({ accept, label, onFiles }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInput = useRef(null)

  function handleFiles(fileList) {
    const files = Array.from(fileList || [])

    if (files.length > 0) {
      onFiles(files)
    }
  }

  function handleInputChange(event) {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  function handleDragOver(event) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  function handleClick() {
    fileInput.current?.click()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`drop-zone${isDragging ? ' dragging' : ''}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="drop-zone-icon">
        <PlusIcon size={22} />
      </span>
      <strong>{label}</strong>
      <small>   Click to browse or drop a file here</small>
      <input
        ref={fileInput}
        type="file"
        accept={accept}
        aria-label={label}
        onChange={handleInputChange}
        onClick={event => event.stopPropagation()}
        hidden
      />
    </div>
  )
}
