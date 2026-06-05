import { Link } from 'react-router-dom'
import { BrandName } from './BrandName'
import { BRAND, BRAND_TAGLINE } from '../../lib/brand'

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-navy-light">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
            <BrandName accentClassName="text-[#f4af47]" />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {BRAND_TAGLINE}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/app" className="hover:text-pitch">Analytics</Link></li>
            <li><Link to="/app/puzzles" className="hover:text-pitch">Tactical Puzzles</Link></li>
            <li><Link to="/app/reports" className="hover:text-pitch">Reports</Link></li>
            <li><Link to="/world-cup" className="hover:text-pitch">World Cup 2030</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/about" className="hover:text-pitch">About Us</Link></li>
            <li><Link to="/app/news" className="hover:text-pitch">Coach News</Link></li>
            <li><Link to="/world-cup/passport" className="hover:text-pitch">Fan Passport</Link></li>
            <li><Link to="/world-cup/tickets" className="hover:text-pitch">Tickets</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Connect</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a href="https://minepi.com" className="hover:text-[#f4af47]">Pi Network</a></li>
            <li><Link to="/world-cup" className="hover:text-pitch">World Cup Hub</Link></li>
            <li><a href="mailto:hello@morocco2030.pi" className="hover:text-pitch">hello@morocco2030.pi</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} {BRAND}. All rights reserved.
      </div>
    </footer>
  )
}
