// Hand-drawn SVG garage tools + the pegboard used on the home page.
// Colours come from CSS (see .tool .steel / .grip in index.css).

function Svg({ children, className = '', style }) {
  return (
    <svg
      className={`tool ${className}`}
      style={style}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function Screwdriver(props) {
  return (
    <Svg {...props}>
      {/* handle */}
      <rect className="grip" x="23" y="2" width="18" height="27" rx="8" />
      <rect className="ridge" x="23" y="11" width="18" height="2.5" />
      <rect className="ridge" x="23" y="17" width="18" height="2.5" />
      <rect className="ridge" x="23" y="23" width="18" height="2.5" />
      {/* collar, shaft, flat tip */}
      <rect className="steel-dark" x="27" y="29" width="10" height="4" rx="1" />
      <rect className="steel" x="30" y="33" width="4" height="23" />
      <path className="steel-dark" d="M29.5 56h5l1.5 7h-8z" />
    </Svg>
  )
}

export function Wrench(props) {
  return (
    <Svg {...props}>
      {/* open-end head */}
      <path
        className="steel"
        d="M21 7h7v10h8V7h7A14.5 14.5 0 1 1 21 7z"
      />
      {/* handle */}
      <rect className="steel" x="27" y="28" width="10" height="33" rx="5" />
      <rect className="ridge" x="29.5" y="44" width="5" height="2" />
      <rect className="ridge" x="29.5" y="49" width="5" height="2" />
    </Svg>
  )
}

export function Hammer(props) {
  return (
    <Svg {...props}>
      {/* handle */}
      <rect className="grip" x="28.5" y="20" width="8" height="42" rx="3.5" />
      <rect className="ridge" x="28.5" y="46" width="8" height="2.5" />
      <rect className="ridge" x="28.5" y="52" width="8" height="2.5" />
      {/* head: claw on the left, face on the right */}
      <rect className="steel" x="12" y="6" width="34" height="16" rx="3" />
      <path className="steel" d="M13 8C6 8 2 12 1 21c5-4 8-4 12-4z" />
      <rect className="steel-dark" x="46" y="4" width="9" height="20" rx="2.5" />
    </Svg>
  )
}

export function Gear(props) {
  return (
    <Svg {...props}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <rect
          key={angle}
          className="steel"
          x="28"
          y="3"
          width="8"
          height="13"
          rx="2"
          transform={`rotate(${angle} 32 32)`}
        />
      ))}
      <path
        className="steel"
        fillRule="evenodd"
        d="M32 13a19 19 0 1 0 0 38a19 19 0 1 0 0-38zM32 25a7 7 0 1 1 0 14a7 7 0 1 1 0-14z"
      />
    </Svg>
  )
}

// Used by ToolCard: picks a tool drawing for each drawer.
export const drawerArt = [
  { name: 'screwdriver', Art: Screwdriver },
  { name: 'wrench', Art: Wrench },
  { name: 'hammer', Art: Hammer },
  { name: 'gear', Art: Gear }
]

// Decorative pegboard for the home page hero.
export function Pegboard() {
  return (
    <div className="pegboard" aria-hidden="true">
      <div className="hang" style={{ '--x': '14%', '--d': '3.2s', '--delay': '0s' }}>
        <Screwdriver style={{ '--grip': '#c9382f' }} />
      </div>
      <div className="hang" style={{ '--x': '38%', '--d': '3.8s', '--delay': '-1s' }}>
        <Wrench />
      </div>
      <div className="hang" style={{ '--x': '62%', '--d': '2.9s', '--delay': '-2s' }}>
        <Hammer style={{ '--grip': '#8a5a2b' }} />
      </div>
      <div className="hang" style={{ '--x': '86%', '--d': '3.5s', '--delay': '-0.5s' }}>
        <Screwdriver style={{ '--grip': '#2f6db0' }} />
      </div>

      <Gear className="gear gear-big" />
      <Gear className="gear gear-small" />

      <div className="hang sign" style={{ '--x': '80%', '--d': '3s', '--delay': '-1.4s' }}>
        OPEN
      </div>
    </div>
  )
}