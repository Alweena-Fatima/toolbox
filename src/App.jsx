import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams
} from 'react-router-dom'
import {
  Search,
  Star,
  Package,
  ArrowLeft,
  House,
  UserRound
} from 'lucide-react'
import { toolkits } from './toolkits'

const all = toolkits.flatMap(kit =>
  kit.tools.map(tool => ({
    ...tool,
    kit,
    key: `${kit.id}/${tool.id}`
  }))
)

const useLS = key => {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  })

  const updateValue = nextValue => {
    setValue(nextValue)
    localStorage.setItem(key, JSON.stringify(nextValue))
  }

  return [value, updateValue]
}

const pick = ids =>
  ids.map(id => all.find(tool => tool.key === id)).filter(Boolean)

const Chip = ({ t }) => (
  <Link
    className="chip"
    to={`/tool/${t.key}`}
    style={{ background: t.kit.color }}
  >
    <t.kit.icon size={16} />
    {t.name}
  </Link>
)

function Home() {
  const [query, setQuery] = useState('')
  const [favourites] = useLS('fav')
  const [recent] = useLS('rec')

  const hits = all.filter(tool =>
    (tool.name + tool.desc + tool.kit.name)
      .toLowerCase()
      .includes(query.toLowerCase())
  )

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
            onChange={event => setQuery(event.target.value)}
            aria-label="Search tools"
          />
        </label>
      </section>

      {query ? (
        <section>
          <h2>
            {hits.length} result{hits.length !== 1 && 's'}
          </h2>
          {hits.length ? (
            <div className="chips">
              {hits.map(tool => (
                <Chip key={tool.key} t={tool} />
              ))}
            </div>
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
              <div className="chips">
                {pick(favourites).map(tool => (
                  <Chip key={tool.key} t={tool} />
                ))}
              </div>
            </section>
          )}

          {recent.length > 0 && (
            <section>
              <h2>Recently used</h2>
              <div className="chips">
                {pick(recent).map(tool => (
                  <Chip key={tool.key} t={tool} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2>Toolkits</h2>
            <div className="grid">
              {toolkits.map(kit => (
                <Link
                  key={kit.id}
                  to={`/kit/${kit.id}`}
                  className="card"
                  style={{ background: kit.color }}
                >
                  <kit.icon size={36} />
                  <h3>{kit.name}</h3>
                  <p>{kit.desc}</p>
                  <small>
                    {kit.tools.length} tool{kit.tools.length > 1 && 's'} · open
                    drawer
                  </small>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}

function Kit() {
  const { kit: kitId } = useParams()
  const kit = toolkits.find(item => item.id === kitId)

  if (!kit) {
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
      <h1>{kit.name}</h1>
      <p>{kit.desc}</p>
      <div className="grid">
        {kit.tools.map(tool => (
          <Link
            key={tool.id}
            to={`/tool/${kit.id}/${tool.id}`}
            className="card"
            style={{ background: kit.color }}
          >
            <kit.icon size={28} />
            <h3>{tool.name}</h3>
            <p>{tool.desc}</p>
          </Link>
        ))}
      </div>
    </>
  )
}

function ToolPage() {
  const { kit, tool } = useParams()
  const currentTool = all.find(item => item.key === `${kit}/${tool}`)
  const [favourites, setFavourites] = useLS('fav')
  const [recent, setRecent] = useLS('rec')

  useEffect(() => {
    if (currentTool) {
      setRecent([
        currentTool.key,
        ...recent.filter(item => item !== currentTool.key)
      ].slice(0, 6))
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

  return (
    <>
      <div className="crumb">
        <Link to="/">Home</Link> /{' '}
        <Link to={`/kit/${currentTool.kit.id}`}>{currentTool.kit.name}</Link> /{' '}
        {currentTool.name}
      </div>
      <div className="titlebar">
        <h1>{currentTool.name}</h1>
        <button
          className={`btn${isFavourite ? ' on' : ''}`}
          aria-pressed={isFavourite}
          onClick={() =>
            setFavourites(
              isFavourite
                ? favourites.filter(item => item !== currentTool.key)
                : [...favourites, currentTool.key]
            )
          }
        >
          <Star
            size={16}
            fill={isFavourite ? 'currentColor' : 'none'}
          />
          {isFavourite ? 'Favourited' : 'Favourite'}
        </button>
      </div>
      <p>{currentTool.desc}</p>
      <currentTool.component key={currentTool.key} />
    </>
  )
}

function About() {
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
      <header className="floating-nav">
        <Link to="/" className="logo">
          <Package size={22} />
          TOOLBOX.
        </Link>
        <nav>
          <Link to="/" className="nav-link">
            <House size={18} />
            <span>Home</span>
          </Link>
          <Link to="/about" className="nav-link">
            <UserRound size={18} />
            <span>About Me</span>
          </Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/kit/:kit" element={<Kit />} />
          <Route path="/tool/:kit/:tool" element={<ToolPage />} />
        </Routes>
      </main>

      <footer>Made with care · everything runs in your browser</footer>
    </BrowserRouter>
  )
}
