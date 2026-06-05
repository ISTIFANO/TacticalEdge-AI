import { Link, Outlet } from 'react-router-dom'
import { BrandName } from '../components/marketing/BrandName'
import { BRAND } from '../lib/brand'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-navy">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-red-900/30 via-navy-light to-navy p-12 lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl" />
          <BrandName className="text-xl" accentClassName="text-[#f4af47]" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            Morocco 2030. Powered by Pi.
          </h2>
          <p className="mt-4 max-w-md text-slate-400">
            Join coaches who use AI match analysis, tactical puzzles, and gamified preparation
            to elevate every decision on and off the pitch.
          </p>
        </div>
        <p className="text-xs text-slate-600">© {BRAND} — Football coaching intelligence</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg" />
          <BrandName accentClassName="text-[#f4af47]" />
        </Link>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
