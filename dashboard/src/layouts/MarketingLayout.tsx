import { Outlet } from 'react-router-dom'
import { MarketingNav } from '../components/marketing/MarketingNav'
import { MarketingFooter } from '../components/marketing/MarketingFooter'

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-navy">
      <MarketingNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  )
}
