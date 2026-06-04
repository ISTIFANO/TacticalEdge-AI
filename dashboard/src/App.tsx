import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MarketingLayout } from './layouts/MarketingLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { Layout } from './components/Layout'
import { HomePage } from './pages/marketing/HomePage'
import { AboutPage } from './pages/marketing/AboutPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { CoachHubPage } from './pages/CoachHubPage'
import { OverviewPage } from './pages/OverviewPage'
import { MatchSummaryPage } from './pages/MatchSummaryPage'
import { PlayerStatsPage } from './pages/PlayerStatsPage'
import { SquadBreakdownPage } from './pages/SquadBreakdownPage'
import { PhysicalPerformancePage } from './pages/PhysicalPerformancePage'
import { EventsFormationsPage } from './pages/EventsFormationsPage'
import { TrackingExplorerPage } from './pages/TrackingExplorerPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { ReportsPage } from './pages/ReportsPage'
import { AssistantPage } from './pages/AssistantPage'
import { LivePage } from './pages/LivePage'
import { TacticalPage } from './pages/TacticalPage'
import { TimelinePage } from './pages/TimelinePage'
import { PuzzlesPage } from './pages/PuzzlesPage'
import { UploadPage } from './pages/UploadPage'
import { NewsPage } from './pages/NewsPage'
import { WorldCupApp } from './worldcup/WorldCupApp'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route
              path="coach"
              element={
                <ProtectedRoute>
                  <CoachHubPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="app"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="match" element={<MatchSummaryPage />} />
              <Route path="players" element={<PlayerStatsPage />} />
              <Route path="squads" element={<SquadBreakdownPage />} />
              <Route path="physical" element={<PhysicalPerformancePage />} />
              <Route path="events" element={<EventsFormationsPage />} />
              <Route path="tracking" element={<TrackingExplorerPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="puzzles" element={<PuzzlesPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="news/:articleId" element={<NewsPage />} />
              <Route path="live" element={<LivePage />} />
              <Route path="tactical" element={<TacticalPage />} />
              <Route path="timeline" element={<TimelinePage />} />
            </Route>

            <Route path="world-cup/*" element={<WorldCupApp />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
