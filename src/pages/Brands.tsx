import { useCallback, useEffect, useMemo, useState } from 'react';
import WalletDashboard from '@/components/dashboard/WalletDashboard';
import SmartPricing from '@/components/dashboard/SmartPricing';
import type { SmartPricingProps } from '@/components/dashboard/SmartPricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';

interface WalletResponse {
  balances: {
    tokens: number;
    fiatUsd: number;
    totalUsdEquivalent: number;
  };
  currentRate: number;
  trailingSeven: {
    tokens: number;
    usd: number;
    dailyBreakdown: Array<{ date: string; tokens: number; usd: number }>;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    reference: string;
    usdEquivalent: number;
    amount: number;
    currency: 'USD' | 'TOKENS';
    timestamp: string;
  }>;
  payoutLog: Array<{
    id: string;
    status: 'pending' | 'processing' | 'completed';
    amountUsd: number;
    currency: string;
    method?: string;
    requestedAt: string;
  }>;
}

interface PricingResponse {
  liveRate: number;
  recommendedBundles: SmartPricingProps['recommendedBundles'];
  volatilityIndex: number;
  baseRate: number;
}

interface ForecastResponse {
  history: number[];
  projectedTokens: number;
  variance: number;
  callouts: string[];
}

interface CoachResponse {
  guidance: string[];
  actions: Array<{ label: string; impact: string }>;
}

interface BrandBrief {
  id: string;
  name: string;
  budgetUsd: number;
  deliverables: string[];
  bonusTokens: number;
  status: 'open' | 'applied' | 'awarded';
}

interface BrandsResponse {
  briefs: BrandBrief[];
  totalOpen: number;
  totalApplied: number;
}

export default function Brands() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [brands, setBrands] = useState<BrandsResponse | null>(null);
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    const response = await fetch('/api/wallet');
    if (!response.ok) throw new Error('Wallet unavailable');
    const data = (await response.json()) as WalletResponse;
    setWallet(data);
  }, []);

  const loadPricing = useCallback(async () => {
    const response = await fetch('/api/pricing');
    if (!response.ok) throw new Error('Pricing unavailable');
    const pricingData = (await response.json()) as PricingResponse;
    setPricing(pricingData);

    const forecastResponse = await fetch('/api/pricing/forecast');
    if (!forecastResponse.ok) throw new Error('Forecast unavailable');
    const forecastData = (await forecastResponse.json()) as ForecastResponse;
    setForecast(forecastData);
  }, []);

  const loadBrands = useCallback(async () => {
    const response = await fetch('/api/brands');
    if (!response.ok) throw new Error('Brand portal unavailable');
    const data = (await response.json()) as BrandsResponse;
    setBrands(data);
  }, []);

  const loadCoach = useCallback(async () => {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tips: [], viewers: [] }),
    });
    if (!response.ok) throw new Error('Coach service offline');
    const data = (await response.json()) as CoachResponse;
    setCoach(data);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        setError(null);
        await Promise.all([loadWallet(), loadPricing(), loadBrands(), loadCoach()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load monetization suite');
      }
    };
    hydrate();
  }, [loadWallet, loadPricing, loadBrands, loadCoach]);

  const applyToBrand = async (brandId: string) => {
    setIsBusy(true);
    try {
      const response = await fetch('/api/brands/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, highlights: ['Top 5% 💎 conversion', 'Weekend energy spikes'] }),
      });
      if (!response.ok) throw new Error('Unable to submit proposal');
      await response.json();
      await loadBrands();
      await loadWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit proposal');
    } finally {
      setIsBusy(false);
    }
  };

  const handleOverride = async (payload: { rate?: number; demand?: number }) => {
    setIsBusy(true);
    try {
      const response = await fetch('/api/pricing/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Unable to update pricing');
      await response.json();
      await loadPricing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pricing override failed');
    } finally {
      setIsBusy(false);
    }
  };

  const pageReady = wallet && pricing && forecast && brands;
  const coachSlides = useMemo(() => coach?.guidance ?? [], [coach]);

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Creator Business Suite</h1>
        <p className="max-w-2xl text-muted-foreground">
          Expand every revenue channel: tune smart pricing, monitor your unified wallet, and secure premium brand deals.
        </p>
      </header>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}
      {!pageReady ? (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
      ) : (
        <>
          <WalletDashboard
            balances={wallet.balances}
            currentRate={wallet.currentRate}
            trailingSeven={wallet.trailingSeven}
            recentTransactions={wallet.recentTransactions}
            payoutLog={wallet.payoutLog}
            onConvert={() => setError('Conversion flow is simulated in this prototype.')}
            onWithdraw={() => setError('Withdrawal flow scheduled through API calls.')} 
            isLoading={isBusy}
          />

          <SmartPricing
            liveRate={pricing.liveRate}
            recommendedBundles={pricing.recommendedBundles}
            forecast={{
              history: forecast.history,
              projectedTokens: forecast.projectedTokens,
              variance: forecast.variance,
              callouts: forecast.callouts,
            }}
            onOverride={handleOverride}
          />

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">Brand Collaboration Portal</CardTitle>
                <CardDescription>Partner with culture-forward brands and earn bonus 💎 packages.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 pr-4">
                  <div className="space-y-4">
                    {brands.briefs.map((brief) => (
                      <div key={brief.id} className="rounded-xl border border-border/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-lg font-semibold">{brief.name}</p>
                            <p className="text-sm text-muted-foreground">${brief.budgetUsd.toLocaleString()} budget</p>
                          </div>
                          <Badge variant="outline">{brief.status}</Badge>
                        </div>
                        <Separator className="my-3" />
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {brief.deliverables.map((deliverable) => (
                            <li key={deliverable}>• {deliverable}</li>
                          ))}
                        </ul>
                        <p className="mt-3 text-sm font-medium text-primary">
                          Bonus {brief.bonusTokens.toLocaleString()} 💎
                        </p>
                        <Button
                          className="mt-4"
                          disabled={brief.status !== 'open' || isBusy}
                          onClick={() => applyToBrand(brief.id)}
                        >
                          {brief.status === 'open' ? 'Apply with AI Proposal' : 'Proposal Submitted'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">AI Earnings Coach</CardTitle>
                <CardDescription>Daily nudges to grow retention, 💎 velocity, and premium tiers.</CardDescription>
              </CardHeader>
              <CardContent>
                {coachSlides.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading guidance...</p>
                ) : (
                  <Carousel>
                    <CarouselContent>
                      {coachSlides.map((slide) => (
                        <CarouselItem key={slide}>
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                            {slide}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                )}
                {coach?.actions && (
                  <div className="mt-4 space-y-2 text-sm">
                    {coach.actions.map((action) => (
                      <div
                        key={action.label}
                        className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                      >
                        <span>{action.label}</span>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                          {action.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
