import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import axe from 'axe-core';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HomeLayout } from '@/components/HomeLayout';
import type { CreatorCardProps } from '@/components/ui/CreatorCard';
import type { OnboardingTip } from '@/components/home/OnboardingTips';

declare global {
  // eslint-disable-next-line no-var
  var window: Window & typeof globalThis;
  // eslint-disable-next-line no-var
  var document: Document;
}

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });

// @ts-expect-error jsdom globals for axe-core
global.window = dom.window;
// @ts-expect-error jsdom globals for axe-core
global.document = dom.window.document;
// @ts-expect-error jsdom globals for axe-core
(global as any).HTMLElement = dom.window.HTMLElement;
// @ts-expect-error jsdom globals for axe-core
(global as any).Node = dom.window.Node;

const creators: CreatorCardProps[] = [
  {
    name: 'Aria Vex',
    live: true,
    thumbnail: 'https://placehold.co/600x400',
    earnings: '$1,200',
  },
  {
    name: 'Mila Fox',
    live: false,
    thumbnail: 'https://placehold.co/600x400',
    earnings: '$980',
  },
];

const onboardingTips: OnboardingTip[] = [
  {
    title: 'Run a test show',
    description: 'Check lighting, camera angle, and audio before broadcasting.',
    actionLabel: 'Open studio',
    onClick: () => undefined,
  },
];

const container = document.createElement('div');
document.body.appendChild(container);

const root = createRoot(container);

await act(async () => {
  root.render(
    <MemoryRouter>
      <HomeLayout
        creators={creators}
        crews={[
          { id: '1', name: 'Vibe Circle', description: 'Daily check-ins with your top fans.', memberCount: 120 },
          { id: '2', name: 'Night Owls', description: 'Late-night talk shows and playlists.', memberCount: 87 },
        ]}
        vibeCoinOptions={[
          { amount: '500', price: '$5' },
          { amount: '1000', price: '$9' },
        ]}
        balance={{ coins: 500, usdValue: 5 }}
        onboardingTips={onboardingTips}
        isNewUser
        onGoLive={() => undefined}
        onSelectCreator={() => undefined}
        heroSlot={<div className="p-4">Hero</div>}
      />
    </MemoryRouter>,
  );
});

const results = await axe.run(container);

console.log('Axe violations:', results.violations.length);
if (results.violations.length > 0) {
  console.log(JSON.stringify(results.violations, null, 2));
}

root.unmount();
container.remove();
