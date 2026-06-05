import { Navigate, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './context/I18nContext'
import { WCThemeProvider } from './context/ThemeContext'
import { WCAuthProvider } from './context/WCAuthContext'
import { PiProvider } from './context/PiContext'
import { EdirhamProvider } from './context/EdirhamContext'
import { BookingProvider } from './context/BookingContext'
import { PassportProvider } from './context/PassportContext'
import { WCPassportPage } from './pages/WCPassportPage'
import { MintRevealModal } from './components/passport/MintRevealModal'
import { WCLayout } from './layouts/WCLayout'
import { WCHomePage } from './pages/WCHomePage'
import { WCAboutPage } from './pages/WCAboutPage'
import { WCHotelsPage } from './pages/WCHotelsPage'
import { WCFlightsPage } from './pages/WCFlightsPage'
import { WCTicketsPage } from './pages/WCTicketsPage'
import { WCTeamsPage } from './pages/WCTeamsPage'
import { WCStadiumsPage } from './pages/WCStadiumsPage'
import { WCPackagesPage } from './pages/WCPackagesPage'
import { WCContactPage } from './pages/WCContactPage'
import { WCLoginPage } from './pages/WCLoginPage'
import { WCRegisterPage } from './pages/WCRegisterPage'
import { WCDashboardPage } from './pages/WCDashboardPage'

export function WorldCupApp() {
  return (
    <WCThemeProvider>
      <I18nProvider>
        <WCAuthProvider>
          <PiProvider>
          <EdirhamProvider>
          <BookingProvider>
            <PassportProvider>
            <Routes>
              <Route element={<WCLayout />}>
                <Route index element={<WCHomePage />} />
                <Route path="about" element={<WCAboutPage />} />
                <Route path="hotels" element={<WCHotelsPage />} />
                <Route path="flights" element={<WCFlightsPage />} />
                <Route path="tickets" element={<WCTicketsPage />} />
                <Route path="teams" element={<WCTeamsPage />} />
                <Route path="stadiums" element={<WCStadiumsPage />} />
                <Route path="packages" element={<WCPackagesPage />} />
                <Route path="contact" element={<WCContactPage />} />
                <Route path="login" element={<WCLoginPage />} />
                <Route path="register" element={<WCRegisterPage />} />
                <Route path="dashboard" element={<WCDashboardPage />} />
                <Route path="passport" element={<WCPassportPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/world-cup" replace />} />
            </Routes>
            <MintRevealModal />
            </PassportProvider>
          </BookingProvider>
          </EdirhamProvider>
          </PiProvider>
        </WCAuthProvider>
      </I18nProvider>
    </WCThemeProvider>
  )
}
