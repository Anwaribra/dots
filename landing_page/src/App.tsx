import React, { useState, useEffect, useRef } from 'react';
import { FloatingNavbar } from './components/navigation/FloatingNavbar';
import { HeroSection } from './features/hero/HeroSection';
import { TheProblem } from './components/marketing/TheProblem';
import { ThreeResponsibilities } from './components/marketing/ThreeResponsibilities';
import { InteractiveAdaptationDemo } from './features/adaptation/InteractiveAdaptationDemo';
import { ChannelsAndIntegrations } from './features/channels/ChannelsAndIntegrations';
import { PlanningPhilosophy } from './features/planning/PlanningPhilosophy';
import { TypicalWeek } from './features/planning/TypicalWeek';
import { DotsLoopSection } from './features/loop/DotsLoopSection';
import { FaqSection } from './features/faq/FaqSection';
import { Footer } from './components/marketing/Footer';
import { PricingPage } from './pages/PricingPage';
import { SignInPage } from './pages/SignInPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

import { AuthProvider } from './context/AuthContext';
import { AppDashboard } from './pages/AppDashboard';

type AppRoute = 'home' | 'pricing' | 'signin' | 'privacy' | 'terms' | 'app';

export const AppContent: React.FC = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') return 'home';
    const hash = window.location.hash;
    if (hash === '#app' || hash === '#dashboard' || hash === '#today' || hash === '#week' || hash === '#changes') return 'app';
    if (hash === '#pricing') return 'pricing';
    if (hash === '#signin' || hash === '#login' || hash === '#account') return 'signin';
    if (hash === '#privacy') return 'privacy';
    if (hash === '#terms') return 'terms';
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#app' || hash === '#dashboard' || hash === '#today' || hash === '#week' || hash === '#changes') {
        setCurrentRoute('app');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#pricing') {
        setCurrentRoute('pricing');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#signin' || hash === '#login' || hash === '#account') {
        setCurrentRoute('signin');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#privacy') {
        setCurrentRoute('privacy');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#terms') {
        setCurrentRoute('terms');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setCurrentRoute('home');
        if (hash && hash !== '#') {
          setTimeout(() => {
            try {
              const target = document.querySelector(hash);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            } catch {
              // Ignore invalid query
            }
          }, 60);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);



  const handleBackToHome = () => {
    window.location.hash = '';
    setCurrentRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentRoute === 'app') {
    return (
      <div ref={appRef} className="dots-app">
        <AppDashboard onBackToLanding={handleBackToHome} />
      </div>
    );
  }

  if (currentRoute === 'signin') {
    return (
      <div ref={appRef} className="dots-app">
        <SignInPage onBackToHome={handleBackToHome} />
      </div>
    );
  }

  return (
    <div ref={appRef} className="dots-app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Floating Contained Liquid Glass Navbar */}
      <FloatingNavbar />

      {currentRoute === 'pricing' ? (
        <main id="main-content">
          <PricingPage onBackToHome={handleBackToHome} />
        </main>
      ) : currentRoute === 'privacy' ? (
        <main id="main-content">
          <PrivacyPage onBackToHome={handleBackToHome} />
        </main>
      ) : currentRoute === 'terms' ? (
        <main id="main-content">
          <TermsPage onBackToHome={handleBackToHome} />
        </main>
      ) : (
        <main id="main-content">
          {/* A. Hero */}
          <HeroSection />

          {/* B. The Problem */}
          <TheProblem />

          {/* Anchor for nav #use-cases */}
          <div id="use-cases" style={{ position: 'relative', top: '-70px', height: 0, visibility: 'hidden' }} />
          {/* C. Three Connected Responsibilities */}
          <ThreeResponsibilities />

          {/* Anchor for nav #product */}
          <div id="product" style={{ position: 'relative', top: '-70px', height: 0, visibility: 'hidden' }} />
          {/* D. Interactive Product Explanation */}
          <InteractiveAdaptationDemo />

          {/* E. Product Channels & Integrations */}
          <ChannelsAndIntegrations />

          {/* F. Planning Philosophy */}
          <div id="manifesto" style={{ position: 'relative', top: '-70px', height: 0, visibility: 'hidden' }} />
          <PlanningPhilosophy />

          {/* G. Workflow / Typical Week */}
          <TypicalWeek />

          {/* H. The Dots Loop */}
          <div id="careers" style={{ position: 'relative', top: '-70px', height: 0, visibility: 'hidden' }} />
          <DotsLoopSection />

          {/* I. Comprehensive FAQ Section */}
          <FaqSection />
        </main>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
