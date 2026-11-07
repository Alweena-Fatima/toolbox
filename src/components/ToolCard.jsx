import { Link } from 'react-router-dom'

export default function ToolCard({
  to,
  title,
  description,
  color,
  icon: Icon,
  iconSize,
  variant = 'card',
  footer
}) {
  return (
    <Link
      className={variant}
      to={to}
      style={color ? { background: color } : undefined}
    >
      {Icon && <Icon size={iconSize || (variant === 'chip' ? 16 : 28)} />}
      {variant === 'chip' ? (
        title
      ) : (
        <>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
          {footer && <small>{footer}</small>}
        </>
      )}
    </Link>
  )
}
