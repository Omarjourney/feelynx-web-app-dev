export interface VibeCoinPackage {
  id: number;
  /** VibeCoins awarded when purchasing on the web */
  tokens: number;
  /** VibeCoins a user would receive in the mobile app */
  appTokens: number;
  /** Percentage increase of web coins compared to the app */
  percentMore: number;
  price: number;
  popular?: boolean;
}

export const PLATFORM_MARGIN = 0.25;
export const CREATOR_SHARE = 0.75;
export const MIN_PLATFORM_PROFIT_PER_COIN = 0.0025;

type RawVibeCoinPackage = Omit<VibeCoinPackage, 'percentMore'> & { percentMore?: number };

const rawPackages: RawVibeCoinPackage[] = [
  { id: 1, tokens: 75, appTokens: 58, price: 0.99 },
  { id: 2, tokens: 400, appTokens: 308, price: 4.99 },
  { id: 3, tokens: 850, appTokens: 654, price: 9.99 },
  { id: 4, tokens: 1450, appTokens: 1115, price: 15.99 },
  { id: 5, tokens: 1950, appTokens: 1500, price: 19.99 },
  { id: 6, tokens: 2495, appTokens: 1919, price: 24.99 },
  { id: 7, tokens: 4995, appTokens: 3842, price: 49.99, popular: true },
  { id: 8, tokens: 9995, appTokens: 7688, price: 99.99 },
  { id: 9, tokens: 14995, appTokens: 11535, price: 149.99 },
];

export const vibeCoinPackages: VibeCoinPackage[] = rawPackages.map((pkg) => {
  const percentMore = ((pkg.tokens - pkg.appTokens) / pkg.appTokens) * 100;
  const platformMarginAmount = pkg.price * PLATFORM_MARGIN;
  const webProfitPerCoin = platformMarginAmount / pkg.tokens;
  const appProfitPerCoin = platformMarginAmount / pkg.appTokens;

  if (webProfitPerCoin < MIN_PLATFORM_PROFIT_PER_COIN) {
    throw new Error(
      `Platform profit per coin (${webProfitPerCoin.toFixed(4)}) is below the minimum for web package ${pkg.id}.`,
    );
  }

  if (appProfitPerCoin < MIN_PLATFORM_PROFIT_PER_COIN) {
    throw new Error(
      `Platform profit per coin (${appProfitPerCoin.toFixed(4)}) is below the minimum for app package ${pkg.id}.`,
    );
  }

  return {
    ...pkg,
    percentMore: Number(percentMore.toFixed(1)),
  };
});
