import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { drawerArt } from './Workshop'

export default function ToolCard({
  to,
  title,
  description,
  color,
  icon: Icon,
  iconSize,
  variant = 'card',
  footer,
  index,
  tags = [],
  badge = 'In-browser'
}) {
  // Small tag-style link used in search results, favourites and recents.
  if (variant === 'chip') {
    return (
      <Link
        className="chip"
        to={to}
        style={color ? { '--accent': color } : undefined}
      >
        {Icon && <Icon size={iconSize || 16} />}
        {title}
      </Link>
    )
  }

  // Tool-chest drawer. Colour and tool drawing cycle by position (see CSS).
  const hasIndex = typeof index === 'number'
  const number = hasIndex ? String(index + 1).padStart(2, '0') : null
  const art = hasIndex ? drawerArt[index % drawerArt.length] : null

  return (
    <Link className="card" to={to} style={{ '--i': index || 0 }}>
      <span className="drawer-handle" aria-hidden="true" />

      {art && (
        <art.Art className={`card-art art-${art.name}`} />
      )}

      <div className="card-top">
        <span className="label-plate">
          {number && <span className="card-num">{number}</span>}
          <span className="badge">{badge}</span>
        </span>
        <span className="card-arrow" aria-hidden="true">
          <ArrowRight size={22} />
        </span>
      </div>

      <h3>{title}</h3>
      {description && <p>{description}</p>}

      {tags.length > 0 && (
        <div className="tags">
          {tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {footer && <small>{footer}</small>}
    </Link>
  )
}