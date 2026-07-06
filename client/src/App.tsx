import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar, Footer, ProtectedRoute } from './components/layout'
import AssistantWidget from './components/layout/AssistantWidget'
import WhatsAppButton from './components/layout/WhatsAppButton'
import BookingReminder from './components/layout/BookingReminder'
import HomePage from './pages/HomePage'
import TripsPage from './pages/TripsPage'
import TripDetailPage from './pages/TripDetailPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import {
  DashboardPage, AboutPage, ContactPage,
  AdminPage, DestinationsPage, NotFoundPage
} from './pages/OtherPages'
import { JournalPage, ArticlePage } from './pages/JournalPages'
import { PrivacyPage, TermsPage, CancellationPage } from './pages/LegalPages'
import DesignPage from './pages/DesignPage'
import SplitPayPage from './pages/SplitPayPage'

// Reset scroll to the top on every route change (SPA navigation otherwise keeps position)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <AssistantWidget />
      <WhatsAppButton />
      <BookingReminder />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
            {/* No layout */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin"    element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

            {/* Dashboard — with the site navbar/footer */}
            <Route path="/dashboard" element={<ProtectedRoute><WithLayout><DashboardPage /></WithLayout></ProtectedRoute>} />
            <Route path="/dashboard/:tab" element={<ProtectedRoute><WithLayout><DashboardPage /></WithLayout></ProtectedRoute>} />

            {/* With layout */}
            <Route path="/" element={<WithLayout><HomePage /></WithLayout>} />
            <Route path="/trips" element={<WithLayout><TripsPage /></WithLayout>} />
            <Route path="/trips/:slug" element={<WithLayout><TripDetailPage /></WithLayout>} />
            <Route path="/design" element={<WithLayout><DesignPage /></WithLayout>} />
            <Route path="/split/:id" element={<WithLayout><SplitPayPage /></WithLayout>} />
            <Route path="/destinations" element={<WithLayout><DestinationsPage /></WithLayout>} />
            <Route path="/journal" element={<WithLayout><JournalPage /></WithLayout>} />
            <Route path="/journal/:slug" element={<WithLayout><ArticlePage /></WithLayout>} />
            <Route path="/about"   element={<WithLayout><AboutPage /></WithLayout>} />
            <Route path="/contact" element={<WithLayout><ContactPage /></WithLayout>} />
            <Route path="/privacy" element={<WithLayout><PrivacyPage /></WithLayout>} />
            <Route path="/terms" element={<WithLayout><TermsPage /></WithLayout>} />
            <Route path="/cancellation" element={<WithLayout><CancellationPage /></WithLayout>} />
            <Route path="*"        element={<WithLayout><NotFoundPage /></WithLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
