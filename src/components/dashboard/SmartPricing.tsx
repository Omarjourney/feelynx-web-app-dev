import React from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface SmartPricingProps {
  liveRate: number;
  recommendedBundles: Array<{
    id: string;
    tokens: number;
    bonus: number;
    tagline: string;
    usdValue: number;
    aiConfidence: number;
  }>;
  forecast: {
    projectedTokens: number;
    variance: number;
    callouts: string[];
    history: number[];
  };
  onOverride?: (payload: { rate?: number; demand?: number }) => void;
}

const pricingChart: ChartConfig = {
  demand: {
    label: 'Demand',
    color: 'hsl(var(--chart-2))',
  },
};

export const SmartPricing: React.FC<SmartPricingProps> = ({
  liveRate,
  recommendedBundles,
  forecast,
  onOverride,
}) => {
  const history = forecast.history.map((value, index) => ({
    label: `D${index + 1}`,
    demand: value,
  }));

  return (
    <Card className="border-primary/10">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" /> Smart Pricing Studio
          </CardTitle>
          <CardDescription>
            Adaptive 💎 economics that amplify conversions across superfans and brand collabs.
          </CardDescription>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Live rate {liveRate.toFixed(2)} USD
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="bundles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-2/3">
            <TabsTrigger value="bundles">Smart Packs</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>
          <TabsContent value="bundles" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {recommendedBundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="rounded-xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/10 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{bundle.tagline}</p>
                      <p className="text-xl font-semibold">{bundle.tokens.toLocaleString()} 💎</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600">
                      +{bundle.bonus}% bonus
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">${bundle.usdValue.toFixed(2)} value</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>AI confidence {(bundle.aiConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onOverride?.({ rate: liveRate })}>
                      Activate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="forecast" className="space-y-4">
            <ChartContainer config={pricingChart} className="h-56 w-full">
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="demand" stroke="hsl(var(--chart-2))" fillOpacity={0.15} fill="currentColor" />
              </AreaChart>
            </ChartContainer>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-primary/20 p-4">
                <p className="text-sm text-muted-foreground">Projected tokens next 7 days</p>
                <p className="text-3xl font-semibold">{forecast.projectedTokens.toLocaleString()} 💎</p>
                <p className="text-xs text-muted-foreground">
                  Variance ±{(forecast.variance * 100).toFixed(0)}% — align premium drops to peak windows.
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 p-4">
                <p className="text-sm text-muted-foreground">AI Callouts</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {forecast.callouts.map((callout) => (
                    <li key={callout} className="flex items-start gap-2">
                      <Zap className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{callout}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartPricing;
