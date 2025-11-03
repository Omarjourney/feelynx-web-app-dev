'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function HeroLogoReveal() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 text-foreground">
      <div className="pointer-events-none absolute -left-10 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-[#9b4dff]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center md:justify-between">
        <motion.div
          className="max-w-xl space-y-6"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            New on Feelynx
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Run your live universe without the giant splash logo.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Launch streams, manage interactive toys, and keep your premium drops flowing. We moved
            the Feelynx mark back to the nav so your first fold can focus on action instead of
            branding.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:w-auto">
              Explore dashboard
            </button>
            <button className="w-full rounded-full border border-border/80 px-6 py-3 text-sm font-semibold transition hover:bg-muted sm:w-auto">
              Preview live tools
            </button>
          </div>
        </motion.div>

        <motion.div
          className="grid w-full max-w-lg gap-4 rounded-3xl border border-border/80 bg-muted/60 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.18)] backdrop-blur md:w-auto"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Live control
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">41 creators streaming now</p>
            <p className="mt-1 text-sm text-muted-foreground">
              One-tap toy sync, goal boosts, and cross-platform alerts.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Payout speed
              </p>
              <p className="mt-2 text-xl font-semibold">2h instant vaults</p>
              <p className="mt-1 text-xs text-muted-foreground">Auto cash-out after event goals.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Communities
              </p>
              <p className="mt-2 text-xl font-semibold">145 fan crews</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Invite-only hubs with quests & badges.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Support</p>
            <p className="mt-2 text-xl font-semibold">Live 24/7 concierge</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drop a ticket or start a call in seconds.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
