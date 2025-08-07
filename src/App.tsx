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
import Groups from './pages/Groups';
import Live from './pages/Live';
import LiveCreator from './pages/LiveCreator';
import NotFound from './pages/NotFound';
import GoLiveButton from '@/components/GoLiveButton';
import DM from './pages/DM';

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
          <Route path="/explore" element={<Explore />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/content" element={<Content />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/dm" element={<DM />} />
          <Route path="/live/:username" element={<Live />} />
          <Route path="/live-creator" element={<LiveCreator />} />
          <Route path="/token-shop" element={<TokenShop />} />
          <Route path="/call-room" element={<CallRoom />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          <GoLiveButton />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
