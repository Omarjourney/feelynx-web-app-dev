import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VibeOption } from '@/components/ui/VibeOption';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const MonetizationSection = () => {
  const navigate = useNavigate();

  const vibePackages = [
    { amount: 500, price: '$5', bonus: '+50 bonus coins' },
    { amount: 1000, price: '$9', bonus: '+100 bonus coins' },
    { amount: 2500, price: '$20', bonus: '+300 bonus coins' },
    { amount: 5000, price: '$35', bonus: '+750 bonus coins' },
  ];

  return (
    <motion.section
      aria-labelledby="monetization-section"
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2
            id="monetization-section"
            className="text-3xl font-semibold tracking-tight text-white"
          >
            VibeCoin Shop
          </h2>
          <Tooltip content="VibeCoins are the currency used to tip creators, unlock premium content, and participate in interactive features. 100 coins = $1.00 USD">
            <p className="mt-1 text-base leading-relaxed text-white/70 cursor-help underline decoration-dotted">
              Power your interactions with VibeCoins 💎
            </p>
          </Tooltip>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-white">Quick Top-ups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vibePackages.map((pkg, index) => (
              <VibeOption
                key={index}
                amount={pkg.amount}
                price={pkg.price}
                bonus={pkg.bonus}
                onSelect={() => navigate('/token-shop')}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-white">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-white/80">
                  💎 What are VibeCoins?
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-white/70">
                  VibeCoins are the premium currency on Feelynx. Use them to tip creators during
                  live streams, unlock exclusive content, and activate interactive toy features.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-white/80">
                  🎁 How do I earn bonus coins?
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-white/70">
                  Larger purchases come with bonus coins! Daily login streaks, participating in PK
                  Battles, and completing crew quests also earn you extra coins.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-white/80">
                  💳 Payment methods
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-white/70">
                  We accept all major credit cards, PayPal, and cryptocurrency payments for your
                  convenience and privacy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Button
        className="w-full rounded-2xl bg-gradient-primary py-6 text-base font-semibold uppercase tracking-[0.25em] text-white shadow-glow"
        onClick={() => navigate('/token-shop')}
        tabIndex={0}
      >
        View Full Shop
      </Button>
    </motion.section>
  );
};
