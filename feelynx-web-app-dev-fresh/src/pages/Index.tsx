import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  MessageCircle,
  Users,
  Workflow,
  Sparkles,
  Heart,
  Zap,
  Shield,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { creators } from '@/data/creators';

const Index = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'viewers',
    search: '',
  });

  const parseCount = (str: string): number => {
    const num = parseFloat(str.replace(/[KM]/g, ''));
    if (str.includes('M')) return num * 1000000;
    if (str.includes('K')) return num * 1000;
    return num;
  };

  const filteredCreators = useMemo(() => {
    return creators
      .filter((c) => {
        if (filters.category !== 'all' && c.category !== filters.category) return false;
        if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'newest') return b.id - a.id;
        if (filters.sort === 'followers')
          return parseCount(b.subscribers) - parseCount(a.subscribers);
        return (b.viewers || 0) - (a.viewers || 0);
      });
  }, [filters]);

  const liveCreators = filteredCreators.filter((c) => c.isLive).slice(0, 8);
  const featuredCreators = filteredCreators.slice(0, 12);

  const features = [
    {
      icon: Zap,
      title: 'Interactive Toys',
      description: 'Sync and control in real-time',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Video,
      title: 'Live Streaming',
      description: 'HD video with zero lag',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Safe & Private',
      description: 'End-to-end encryption',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Heart,
      title: 'Premium Content',
      description: 'Exclusive vault access',
      gradient: 'from-red-500 to-orange-500',
    },
  ];

  const quickLinks = [
    {
      id: 'feelynx-control',
      title: 'Feelynx control room',
      badge: 'Interactive toys',
      description: 'Sync toys, launch interactive patterns, and run playbooks in one tap.',
      icon: Workflow,
      action: () => navigate('/call-room'),
      actionLabel: 'Open control',
    },
    {
      id: 'messages',
      title: 'Messages & threads',
      badge: 'Community',
      description: 'Keep DMs, fan mail, and unlockable replies in one focused inbox.',
      icon: MessageCircle,
      action: () => navigate('/dm'),
      actionLabel: 'Go to inbox',
    },
    {
      id: 'content',
      title: 'Premium content',
      badge: 'Vault',
      description: 'Drop clips, galleries, and vault packs with smart sorting for fans.',
      icon: Video,
      action: () => navigate('/content'),
      actionLabel: 'Browse library',
    },
    {
      id: 'groups',
      title: 'Family crews',
      badge: 'Groups',
      description: 'Join curated micro-communities with live chat boosts and shared quests.',
      icon: Users,
      action: () => navigate('/groups'),
      actionLabel: 'View crews',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex"
            >
              <Badge className="bg-gradient-primary px-4 py-2 text-sm font-semibold">
                <Sparkles className="mr-2 h-4 w-4" />
                Next-Gen Interactive Platform
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl"
            >
              Connect Beyond
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Boundaries
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10 text-lg text-muted-foreground md:text-xl"
            >
              Experience interactive streaming, premium content, and real connections.
              <br />
              Join thousands discovering a new way to engage.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="group bg-gradient-primary px-8 py-6 text-lg font-semibold shadow-glow transition-all hover:scale-105 hover:brightness-110"
                onClick={() => navigate('/explore')}
              >
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                onClick={() => navigate('/live-creator')}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Go Live
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-16 grid grid-cols-3 gap-8 text-center"
            >
              <div>
                <div className="text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Active Creators</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">1M+</div>
                <div className="text-sm text-muted-foreground">Live Sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for modern creators and fans
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-white/10 bg-gradient-card backdrop-blur-xl transition-all hover:scale-105 hover:border-white/20">
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10', feature.gradient)} />
                <CardContent className="relative p-6">
                  <div className={cn('mb-4 inline-flex rounded-2xl bg-gradient-to-br p-3', feature.gradient)}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold">Quick Access</h2>
          <p className="text-lg text-muted-foreground">
            Jump right into what matters most
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden border-white/10 bg-gradient-card backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-glow">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-2xl bg-gradient-primary p-3">
                      <link.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {link.badge}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">{link.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{link.description}</p>
                  <Button
                    onClick={link.action}
                    variant="ghost"
                    className="group/btn w-full justify-between hover:bg-white/5"
                  >
                    {link.actionLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Creators Section */}
      {liveCreators.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-center justify-between"
          >
            <div>
              <h2 className="mb-2 text-4xl font-bold">Live Now</h2>
              <p className="text-lg text-muted-foreground">
                Join {liveCreators.length} creators streaming live
              </p>
            </div>
            <Button
              onClick={() => navigate('/explore')}
              variant="outline"
              className="hidden md:inline-flex"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {liveCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group cursor-pointer overflow-hidden border-white/10 bg-gradient-card backdrop-blur-xl transition-all hover:scale-105 hover:border-white/20 hover:shadow-glow"
                  onClick={() => navigate(`/live/${creator.username}`)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Live Badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      LIVE
                    </div>

                    {/* Viewer Count */}
                    {creator.viewers && (
                      <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        👁 {creator.viewers.toLocaleString()}
                      </div>
                    )}

                    {/* Creator Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="mb-1 text-lg font-bold text-white">{creator.name}</h3>
                      <p className="text-sm text-white/80">@{creator.username}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-12 text-center"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          <div className="relative">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Join our community and start your journey today
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-white px-8 py-6 text-lg font-semibold text-purple-600 shadow-xl hover:scale-105 hover:bg-white/90"
                onClick={() => navigate('/auth')}
              >
                Sign Up Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white px-8 py-6 text-lg font-semibold text-white hover:bg-white/10"
                onClick={() => navigate('/explore')}
              >
                Explore First
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
