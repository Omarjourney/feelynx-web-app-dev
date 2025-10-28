import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Index from './pages/Index';
import TokenShop from './pages/TokenShop';
import CallRoom from './pages/CallRoom';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Creators from './pages/Creators';
import Content from './pages/Content';
import Calls from './pages/Calls';
import Match from './pages/Match';
import Groups from './pages/Groups';
import GroupPage from './features/groups/GroupPage';
import DM from './pages/DM';
import Live from './pages/Live';
import LiveCreator from './pages/LiveCreator';
import Stories from './pages/Stories';
import PKBattle from './pages/PKBattle';
import NotFound from './pages/NotFound';
import SettingsPrivacy from './pages/SettingsPrivacy';
import PatternsLibrary from './features/patterns/PatternsLibrary';
import PatternEditor from './features/patterns/PatternEditor';
import ControlRemote from './features/remote/ControlRemote';
import CompanionsHome from './features/companions/CompanionsHome';
import ContestsFeed from './features/contests/ContestsFeed';
import { GoLiveButton } from '@/components/live';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/discover" element={<Explore />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/content" element={<Content />} />
            <Route path="/calls" element={<Calls />} />
            <Route path="/match" element={<Match />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupId" element={<GroupPage />} />
            <Route path="/dm" element={<DM />} />
            <Route path="/live/:username" element={<Live />} />
            <Route path="/live-creator" element={<LiveCreator />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/token-shop" element={<TokenShop />} />
            <Route path="/coins" element={<TokenShop />} />
            <Route path="/settings" element={<SettingsPrivacy />} />
            <Route path="/patterns" element={<PatternsLibrary />} />
            <Route path="/patterns/editor" element={<PatternEditor />} />
            <Route path="/remote" element={<ControlRemote />} />
            <Route path="/companions" element={<CompanionsHome />} />
            <Route path="/contests" element={<ContestsFeed />} />
            <Route path="/call-room" element={<CallRoom />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GoLiveButton />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
