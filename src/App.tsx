import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Auth from './pages/Auth';
import Index from './pages/Index';
import IndexRefactored from './pages/IndexRefactored';
import TokenShop from './pages/TokenShop';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Creators from './pages/Creators';
import Content from './pages/Content';
// import Calls from './pages/Calls';
import Connect from './pages/Connect';
import Match from './pages/Match';
import Groups from './pages/Groups';
import GroupPage from './features/groups/GroupPage';
import GroupAdmin from './features/groups/GroupAdmin';
import MessagesPage from './pages/Messages';
import Live from './pages/Live';
import LiveCreator from './pages/LiveCreator';
import Stories from './pages/Stories';
import PKBattle from './pages/PKBattle';
import NotFound from './pages/NotFound';
import SettingsPrivacy from './pages/SettingsPrivacy';
import PatternHub from './features/patterns/PatternHub';
import ToysHub from './features/toys/ToysHub';
import ControlRemote from './features/remote/ControlRemote';
import CompanionsHome from './features/companions/CompanionsHome';
import ContestsFeed from './features/contests/ContestsFeed';
import Styleguide from './pages/Styleguide';
import AutoThemeController from '@/components/AutoThemeController';
import AppShell from '@/components/layout/AppShell';
import ToastProvider from '@/components/providers/ToastProvider';
import CreatorInsights from './pages/CreatorInsights';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <ToastProvider>
            <AutoThemeController />
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/refactored" element={<IndexRefactored />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/discover" element={<Explore />} />
                  <Route path="/creators" element={<Creators />} />
                  <Route path="/content" element={<Content />} />
                  <Route path="/connect" element={<Connect />} />
                  <Route path="/match" element={<Match />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/:groupId" element={<GroupPage />} />
                  <Route path="/groups/:groupId/admin" element={<GroupAdmin />} />
                  <Route path="/dm" element={<MessagesPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/live/:username" element={<Live />} />
                  <Route path="/live-creator" element={<LiveCreator />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/token-shop" element={<TokenShop />} />
                  <Route path="/coins" element={<TokenShop />} />
                  <Route path="/settings" element={<SettingsPrivacy />} />
                  <Route path="/patterns" element={<Navigate to="/toys" replace />} />
                  <Route path="/toys" element={<ToysHub />} />
                  <Route path="/remote" element={<Navigate to="/toys?tab=long" replace />} />
                  <Route path="/companions" element={<CompanionsHome />} />
                  <Route path="/contests" element={<ContestsFeed />} />
                  <Route path="/styleguide" element={<Styleguide />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/creator-insights" element={<CreatorInsights />} />
                </Route>
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
