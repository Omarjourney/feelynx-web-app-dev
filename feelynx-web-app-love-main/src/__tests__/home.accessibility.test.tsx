import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router-dom';
import { HomeLayout } from '@/components/HomeLayout';
import type { CreatorCardProps } from '@/components/ui/CreatorCard';
import type { OnboardingTip } from '@/components/home/OnboardingTips';
import React from 'react';

const noop = () => undefined;

afterEach(() => {
  document.body.innerHTML = '';
});

const render = (ui: React.ReactElement) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { container, root };
};

describe('HomeLayout accessibility', () => {
  it('has no detectable axe-core violations', async () => {
    const creators: CreatorCardProps[] = [
      {
        name: 'Test Creator',
        live: true,
        thumbnail: 'https://placehold.co/600x400',
        earnings: '$1,200',
      },
      {
        name: 'Replay Host',
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
        onClick: noop,
      },
    ];

    const { container, root } = render(
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
          onGoLive={noop}
          onSelectCreator={noop}
          heroSlot={<div className="p-4">Hero</div>}
        />
      </MemoryRouter>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    const results = await axe.run(container);

    expect(results.violations).toEqual([]);

    root.unmount();
    container.remove();
  });
});
