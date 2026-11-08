import { useState } from 'react'
import { Download, FileSearch, FolderUp } from 'lucide-react'
import {
  analyse,
  collectFromDrop,
  download,
  formatBytes,
  fromInput,
  toCSV
} from './CodebaseUtils'

function Stat({ label, value }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

function Analyser() {
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState('')
  const [skip, setSkip] = useState(true)
  const [over, setOver] = useState(false)

  const runAnalysis = async getFiles => {
    setBusy(true)
    setErr('')
    setRes(null)

    try {
      const { list, skippedDirs } = await getFiles()
      if (!list.length) {
        throw new Error('No files found. Is the folder empty?')
      }

      setRes(
        await analyse(list, {
          skip,
          skippedDirs,
          onProgress: (current, total) => {
            setProg(`Reading ${current} of ${total} files…`)
          }
        })
      )
    } catch (error) {
      setErr(error.message)
    }

    setBusy(false)
  }

  const onPick = event => {
    const files = event.target.files
    if (files.length) {
      runAnalysis(async () => ({
        list: fromInput(files),
        skippedDirs: []
      }))
    }
    event.target.value = ''
  }

  const onDrop = event => {
    event.preventDefault()
    setOver(false)

    // The browser's drag data is only available while handling this event.
    const items = event.dataTransfer.items
    runAnalysis(() => collectFromDrop(items, skip))
  }

  const name = res?.root || 'project'
  const save = (text, type, extension) => {
    download(
      new Blob([text], { type }),
      `${name}-report.${extension}`
    )
  }

  return (
    <div className="col code-analyser">
      <label
        className={`drop${over ? ' over' : ''}`}
        onDragOver={event => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <FolderUp size={28} />
        <b>{res ? 'Analyse another folder' : 'Drop a project folder'}</b>
        <small>
          Drag &amp; drop a folder, or click to choose one. Nothing is uploaded.
        </small>
        <input
          type="file"
          hidden
          webkitdirectory=""
          multiple
          onChange={onPick}
        />
      </label>

      <label className="row">
        <input
          type="checkbox"
          checked={skip}
          onChange={event => setSkip(event.target.checked)}
        />
        Skip node_modules, .git, dist, build and similar folders (applies to the
        next folder)
      </label>

      {busy && <p>{prog || 'Starting…'}</p>}
      {err && (
        <div className="err" role="alert">
          ⚠ {err}
        </div>
      )}
      {!res && !busy && !err && (
        <div className="empty">
          Pick a folder to see its files, lines and file types.
        </div>
      )}

      {res && (
        <section className="analysis-results" aria-label="Analysis results">
          <div className="analysis-heading">
            <div>
              <span className="analysis-kicker">Scan complete</span>
              <h2>Project summary</h2>
              <p>{res.root || 'Selected project'}</p>
            </div>
          </div>

          <div className="stats">
            <Stat label="Files" value={res.files} />
            <Stat label="Folders (incl. root)" value={res.folders} />
            <Stat label="Total lines" value={res.total.toLocaleString()} />
            <Stat label="Code lines" value={res.code.toLocaleString()} />
            <Stat label="Comment lines" value={res.comment.toLocaleString()} />
            <Stat label="Blank lines" value={res.blank.toLocaleString()} />
            <Stat label="Total size" value={formatBytes(res.size)} />
            <Stat label="Folder depth" value={res.maxDepth} />
          </div>

          {(res.ignored.folders.length > 0 ||
            res.binary > 0 ||
            res.tooLarge > 0) && (
            <div className="analysis-notice">
              {res.ignored.folders.length > 0 && (
                <>
                  Skipped folders: {res.ignored.folders.join(', ')}
                  {res.ignored.files > 0 && ` (${res.ignored.files} files)`}.{' '}
                </>
              )}
              {res.binary > 0 && (
                <>{res.binary} binary files counted by size only. </>
              )}
              {res.tooLarge > 0 && (
                <>{res.tooLarge} files over 2 MB not line-counted.</>
              )}
            </div>
          )}

          <section className="analysis-panel" aria-labelledby="file-types-title">
            <div className="analysis-panel-heading">
              <h3 id="file-types-title">File types</h3>
              <span>{res.types.length} types</span>
            </div>
            <div className="scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Files</th>
                    <th>Share</th>
                    <th>Lines</th>
                    <th>Code</th>
                    <th>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {res.types.map(type => (
                    <tr key={type.ext}>
                      <td>
                        {type.name}{' '}
                        {type.ext !== '(none)' && <small>.{type.ext}</small>}
                      </td>
                      <td>{type.files}</td>
                      <td>
                        <div
                          className="bar"
                          role="img"
                          aria-label={`${((type.files / res.files) * 100).toFixed(1)}% of files`}
                        >
                          <i
                            style={{
                              width: `${(type.files / res.files) * 100}%`
                            }}
                          />
                        </div>
                      </td>
                      <td>{type.total.toLocaleString()}</td>
                      <td>{type.code.toLocaleString()}</td>
                      <td>{formatBytes(type.size)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="analysis-lists">
            <section
              className="analysis-panel analysis-file-list"
              aria-labelledby="largest-files-title"
            >
              <div className="analysis-panel-heading">
                <h3 id="largest-files-title">Largest files</h3>
                <span>By size</span>
              </div>
              {res.largest.length > 0 ? (
                res.largest.map(file => (
                  <div className="item" key={file.path}>
                    <span>{file.path}</span>
                    <small>{formatBytes(file.size)}</small>
                  </div>
                ))
              ) : (
                <p className="analysis-empty">No files to display.</p>
              )}
            </section>

            <section
              className="analysis-panel analysis-file-list"
              aria-labelledby="longest-files-title"
            >
              <div className="analysis-panel-heading">
                <h3 id="longest-files-title">Longest files</h3>
                <span>By line count</span>
              </div>
              {res.longest.length > 0 ? (
                res.longest.map(file => (
                  <div className="item" key={file.path}>
                    <span>{file.path}</span>
                    <small>{file.lines.toLocaleString()} lines</small>
                  </div>
                ))
              ) : (
                <p className="analysis-empty">No text files to display.</p>
              )}
            </section>
          </div>

          <div className="analysis-actions">
            <button
              className="btn main"
              onClick={() =>
                save(JSON.stringify(res, null, 2), 'application/json', 'json')
              }
            >
              <Download size={16} />
              Report (JSON)
            </button>
            <button
              className="btn"
              onClick={() => save(toCSV(res), 'text/csv', 'csv')}
            >
              <Download size={16} />
              File types (CSV)
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export const code = {
  id: 'code',
  name: 'Code Analyser',
  desc: 'Count files, folders, lines and file types.',
  color: '#ddbea9',
  icon: FileSearch,
  tools: [
    {
      id: 'project',
      name: 'Project Analyser',
      desc: 'Drop a folder to see files, folders, lines and a file-type breakdown.',
      component: Analyser
    }
  ]
}
