
import { useState } from 'react'
import { Images, Download, Copy, Check, Wand2 } from 'lucide-react'
import DropZone from '../../components/DropZone'

import {
    formatBytes, download, EXT, compressImage, convertImage,
    resizeImage, fileToDataURL, fileToBytes, toHex, toBinary
} from './imageUtils'

const ALL = [
    ['image/jpeg', 'JPG'],
    ['image/webp', 'WebP'],
    ['image/png', 'PNG']
]

// Reusable dropdown
function Sel({ label, value, onChange, items }) {
    return (
        <label className="field">
            <span>{label}</span>
            <select value={value} onChange={e => onChange(e.target.value)}>
                {items.map(([value, name]) => (
                    <option key={value} value={value}>{name}</option>
                ))}
            </select>
        </label>
    )
}

function ImageTool({ kind }) {
    const [file, setFile] = useState(null)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const [options, setOptions] = useState({
        quality: 0.7,
        type: 'image/jpeg',
        width: '',
        height: '',
        keepRatio: true,
        mode: 'hex'
    })

    // Update one option
    function updateOption(key, value) {
        setOptions({ ...options, [key]: value })
    }

    // Process the selected image
    async function run() {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            if (kind === 'base64') {
                const text = await fileToDataURL(file)
                setResult({ text })
            }
            else if (kind === 'bytes') {
                const bytes = await fileToBytes(file)

                const text = options.mode === 'hex'
                    ? toHex(bytes)
                    : toBinary(bytes)

                setResult({ text })
            }
            else {
                let output

                if (kind === 'compress') {
                    output = await compressImage(file, options)
                }
                else if (kind === 'convert') {
                    output = await convertImage(file, options.type)
                }
                else {
                    output = await resizeImage(file, options)
                }

                setResult({
                    ...output,
                    url: URL.createObjectURL(output.blob)
                })
            }
        }
        catch (e) {
            setError(e.message)
        }

        setLoading(false)
    }

    // Get filename without extension
    const baseName = file
        ? file.name.replace(/\.[^.]+$/, '')
        : ''

    // Calculate size reduction percentage
    const difference = result?.blob
        ? Math.round((1 - result.blob.size / file.size) * 100)
        : 0

    // Copy text result
    async function copyResult() {
        await navigator.clipboard.writeText(result.text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
    }

    return (
        <div className="work">

            {/* Left side: Upload and settings */}
            <div className="col">

                <DropZone
                    accept="image/*"
                    label={file ? 'Choose a different image' : 'Drop an image'}
                    onFiles={files => {
                        setFile(files[0])
                        setResult(null)
                        setError('')
                    }}
                />

                {file && (
                    <div className="item">
                        <img
                            className="thumb"
                            src={URL.createObjectURL(file)}
                            alt=""
                        />
                        <span>
                            {file.name}
                            <br />
                            <small>{formatBytes(file.size)}</small>
                        </span>
                    </div>
                )}

                {/* Compressor settings */}
                {kind === 'compress' && (
                    <>
                        <label className="field">
                            <span>Quality: {Math.round(options.quality * 100)}%</span>
                            <input
                                type="range"
                                min=".1"
                                max="1"
                                step=".05"
                                value={options.quality}
                                onChange={e => updateOption('quality', Number(e.target.value))}
                            />
                        </label>

                        <Sel
                            label="Output format"
                            value={options.type}
                            onChange={value => updateOption('type', value)}
                            items={ALL.slice(0, 2)}
                        />
                    </>
                )}

                {/* Converter settings */}
                {kind === 'convert' && (
                    <Sel
                        label="Convert to"
                        value={options.type}
                        onChange={value => updateOption('type', value)}
                        items={ALL}
                    />
                )}

                {/* Resizer settings */}
                {kind === 'resize' && (
                    <>
                        <div className="row">
                            <label className="field">
                                <span>Width (px)</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={options.width}
                                    onChange={e => updateOption('width', e.target.value)}
                                />
                            </label>

                            <label className="field">
                                <span>Height (px)</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={options.height}
                                    onChange={e => updateOption('height', e.target.value)}
                                />
                            </label>
                        </div>

                        <label className="row">
                            <input
                                type="checkbox"
                                checked={options.keepRatio}
                                onChange={e => updateOption('keepRatio', e.target.checked)}
                            />
                            Keep proportions (width wins)
                        </label>
                    </>
                )}

                {/* Bytes settings */}
                {kind === 'bytes' && (
                    <Sel
                        label="Show as"
                        value={options.mode}
                        onChange={value => updateOption('mode', value)}
                        items={[
                            ['hex', 'Hex'],
                            ['binary', 'Binary']
                        ]}
                    />
                )}

                <div className="row">
                    <button
                        className="btn main"
                        disabled={!file || loading}
                        onClick={run}
                    >
                        <Wand2 size={16} />
                        {loading ? 'Working...' : 'Go'}
                    </button>
                </div>
            </div>

            {/* Right side: Result */}
            <div className="col">
                <span className="lbl">Result</span>

                {error ? (
                    <div className="err" role="alert">
                        ⚠ {error}
                    </div>
                ) : result?.blob ? (
                    <>
                        <img
                            className="thumb"
                            src={result.url}
                            alt="Result preview"
                        />

                        <p>
                            {formatBytes(file.size)} → <b>{formatBytes(result.blob.size)}</b>
                            {' · '}
                            {result.width} × {result.height}px
                            {' · '}
                            {difference >= 0
                                ? `${difference}% smaller`
                                : `${-difference}% larger`}
                        </p>

                        <div className="row">
                            <button
                                className="btn main"
                                onClick={() => download(
                                    result.blob,
                                    `${baseName}-${kind}.${EXT[result.blob.type]}`
                                )}
                            >
                                <Download size={16} />
                                Download
                            </button>
                        </div>
                    </>
                ) : result ? (
                    <>
                        <textarea
                            readOnly
                            rows={12}
                            value={result.text}
                        />

                        <div className="row">
                            <button className="btn" onClick={copyResult}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>

                            <button
                                className="btn"
                                onClick={() => download(
                                    new Blob([result.text]),
                                    `${baseName}-${kind}.txt`
                                )}
                            >
                                <Download size={16} />
                                Download .txt
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty">
                        {file
                            ? 'Press Go to see the result.'
                            : 'Add an image to get started.'}
                    </div>
                )}
            </div>
        </div>
    )
}

// Image Toolkit configuration
export const image = {
    id: 'image',
    name: 'Image Toolkit',
    desc: 'Shrink, convert and resize pictures.',
    color: '#a0c4ff',
    icon: Images,

    tools: [
        {
            id: 'compressor',
            name: 'Image Compressor',
            desc: 'Make image files smaller.',
            component: () => <ImageTool kind="compress" />
        },
        {
            id: 'converter',
            name: 'Image Converter',
            desc: 'Switch between PNG, JPG and WebP.',
            component: () => <ImageTool kind="convert" />
        },
        {
            id: 'resizer',
            name: 'Image Resizer',
            desc: 'Change an image’s width and height.',
            component: () => <ImageTool kind="resize" />
        },
        {
            id: 'base64',
            name: 'Image to Base64',
            desc: 'Get a data URL for any image.',
            component: () => <ImageTool kind="base64" />
        },
        {
            id: 'bytes',
            name: 'Image to Binary / Hex',
            desc: 'See an image’s raw bytes (max 1 MB).',
            component: () => <ImageTool kind="bytes" />
        }
    ]
}
