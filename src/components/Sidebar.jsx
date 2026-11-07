import { House, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
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
  )
}
