import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Header() {
  return (
    <header className="floating-nav">
      <Link to="/" className="logo">
        <Package size={22} />
        TOOLBOX.
      </Link>
      <Sidebar />
    </header>
  )
}
