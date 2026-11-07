import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams
} from 'react-router-dom'
import { ArrowLeft, Search, Star } from 'lucide-react'
import Header from './components/Header'
import ToolCard from './components/ToolCard'
import { toolkits } from './data/toolkits'

function getAllTools() {
  const allTools = []

  for (let toolkitIndex = 0; toolkitIndex < toolkits.length; toolkitIndex++) {
    const toolkit = toolkits[toolkitIndex]

    for (let toolIndex = 0; toolIndex < toolkit.tools.length; toolIndex++) {
      const tool = toolkit.tools[toolIndex]
      allTools.push({
        ...tool,
        kit: toolkit,
        key: `${toolkit.id}/${tool.id}`
      })
    }
  }

  return allTools
}

const allTools = getAllTools()

function useLocalStorage(key) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  })

  function updateValue(nextValue) {
    const valueToStore = typeof nextValue === 'function'
      ? nextValue(value)
      : nextValue

    setValue(valueToStore)
    localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [value, updateValue]
}

function getToolsByKeys(toolKeys) {
  const matchingTools = []

  for (let keyIndex = 0; keyIndex < toolKeys.length; keyIndex++) {
    const tool = allTools.find(item => item.key === toolKeys[keyIndex])

    if (tool) {
      matchingTools.push(tool)
    }
  }

  return matchingTools
}

function ToolList({ tools }) {
  return (
    <div className="chips">
      {tools.map(tool => (
        <ToolCard
          key={tool.key}
          to={`/tool/${tool.key}`}
          title={tool.name}
          color={tool.kit.color}
          icon={tool.kit.icon}
          variant="chip"
        />
      ))}
    </div>
  )
}

function ToolkitGrid({ items }) {
  return (
    <div className="grid">
      {items.map(toolkit => {
        const toolCountLabel = toolkit.tools.length === 1 ? 'tool' : 'tools'

        return (
          <ToolCard
            key={toolkit.id}
            to={`/kit/${toolkit.id}`}
            title={toolkit.name}
            description={toolkit.desc}
            color={toolkit.color}
            icon={toolkit.icon}
            iconSize={36}
            footer={`${toolkit.tools.length} ${toolCountLabel} · open drawer`}
          />
        )
      })}
    </div>
  )
}

function HomePage() {
  const [query, setQuery] = useState('')
  const [favourites] = useLocalStorage('fav')
  const [recentTools] = useLocalStorage('rec')
  const matchingTools = []
  const normalizedQuery = query.toLowerCase()

  for (let index = 0; index < allTools.length; index++) {
    const tool = allTools[index]
    const searchText = `${tool.name}${tool.desc}${tool.kit.name}`

    if (searchText.toLowerCase().includes(normalizedQuery)) {
      matchingTools.push(tool)
    }
  }

  function handleSearchChange(event) {
    setQuery(event.target.value)
  }

  return (
    <>
      <section className="hero">
        <h1>
          Every little job
          <br />
          has a little tool.
        </h1>
        <p>
          Free, private tools that run right in your browser. No sign-up,
          nothing uploaded.
        </p>
        <label className="search">
          <Search size={20} />
          <input
            placeholder="Find your tool…"
            value={query}
            onChange={handleSearchChange}
            aria-label="Search tools"
          />
        </label>
      </section>

      {query ? (
        <section>
          <h2>
            {matchingTools.length} result
            {matchingTools.length !== 1 && 's'}
          </h2>
          {matchingTools.length > 0 ? (
            <ToolList tools={matchingTools} />
          ) : (
            <div className="empty">
              No tool matches “{query}”. Try “json” or “hash”.
            </div>
          )}
        </section>
      ) : (
        <>
          {favourites.length > 0 && (
            <section>
              <h2>Favourites</h2>
              <ToolList tools={getToolsByKeys(favourites)} />
            </section>
          )}

          {recentTools.length > 0 && (
            <section>
              <h2>Recently used</h2>
              <ToolList tools={getToolsByKeys(recentTools)} />
            </section>
          )}

          <section>
            <h2>Toolkits</h2>
            <ToolkitGrid items={toolkits} />
          </section>
        </>
      )}
    </>
  )
}

function ToolkitPage() {
  const { kit: toolkitId } = useParams()
  const toolkit = toolkits.find(item => item.id === toolkitId)

  if (!toolkit) {
    return (
      <div className="empty">
        Toolkit not found. <Link to="/">Go home</Link>
      </div>
    )
  }

  return (
    <>
      <Link to="/" className="back">
        <ArrowLeft size={16} />
        Home
      </Link>
      <h1>{toolkit.name}</h1>
      <p>{toolkit.desc}</p>
      <div className="grid">
        {toolkit.tools.map(tool => (
          <ToolCard
            key={tool.id}
            to={`/tool/${toolkit.id}/${tool.id}`}
            title={tool.name}
            description={tool.desc}
            color={toolkit.color}
            icon={toolkit.icon}
          />
        ))}
      </div>
    </>
  )
}

function ToolPage() {
  const { kit: toolkitId, tool: toolId } = useParams()
  const currentTool = allTools.find(
    tool => tool.key === `${toolkitId}/${toolId}`
  )
  const [favourites, setFavourites] = useLocalStorage('fav')
  const [, setRecentTools] = useLocalStorage('rec')

  useEffect(() => {
    if (currentTool) {
      setRecentTools(recentTools => {
        const filteredTools = recentTools.filter(
          toolKey => toolKey !== currentTool.key
        )

        return [currentTool.key, ...filteredTools].slice(0, 6)
      })
    }
  }, [currentTool?.key])

  if (!currentTool) {
    return (
      <div className="empty">
        Tool not found. <Link to="/">Go home</Link>
      </div>
    )
  }

  const isFavourite = favourites.includes(currentTool.key)
  const ToolComponent = currentTool.component

  function handleFavouriteClick() {
    setFavourites(currentFavourites => {
      if (currentFavourites.includes(currentTool.key)) {
        return currentFavourites.filter(
          toolKey => toolKey !== currentTool.key
        )
      }

      return [...currentFavourites, currentTool.key]
    })
  }

  return (
    <>
      <div className="crumb">
        <Link to="/">Home</Link> /{' '}
        <Link to={`/kit/${currentTool.kit.id}`}>
          {currentTool.kit.name}
        </Link>{' '}
        / {currentTool.name}
      </div>
      <div className="titlebar">
        <h1>{currentTool.name}</h1>
        <button
          className={`btn${isFavourite ? ' on' : ''}`}
          aria-pressed={isFavourite}
          onClick={handleFavouriteClick}
        >
          <Star
            size={16}
            fill={isFavourite ? 'currentColor' : 'none'}
          />
          {isFavourite ? 'Favourited' : 'Favourite'}
        </button>
      </div>
      <p>{currentTool.desc}</p>
      <ToolComponent key={currentTool.key} />
    </>
  )
}

function AboutPage() {
  return (
    <section className="about">
      <h1>About Me</h1>
      <p>
        This is a placeholder for your introduction. Add a little about
        yourself, what you do, and how people can get in touch.
      </p>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/kit/:kit" element={<ToolkitPage />} />
          <Route path="/tool/:kit/:tool" element={<ToolPage />} />
        </Routes>
      </main>
      <footer>Made with care · everything runs in your browser</footer>
    </BrowserRouter>
  )
}
