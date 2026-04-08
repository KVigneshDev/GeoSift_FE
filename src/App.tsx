import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import { apolloClient } from '@/apollo/client';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import GoogleMapsLoader from '@/features/propertyMap/components/GoogleMapsLoader';

// Pages
import LandingPage from '@/features/auth/LandingPage';
import PropertyMap from '@/features/propertyMap/PropertyMap';
import NotFound from '@/features/auth/NotFound';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LandingPage />} />
              <Route path="/map" element={<ProtectedRoute><GoogleMapsLoader>{<PropertyMap />}</GoogleMapsLoader></ProtectedRoute>} />
              {/* <Route path="/dashboard" element={<ProtectedRoute><PropertyMap /></ProtectedRoute>} /> */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: '',
            style: {
              background: 'white',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: { primary: '#3b82f6', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'white' },
            },
          }}
        />
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;