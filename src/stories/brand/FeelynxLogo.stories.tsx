import type { Meta, StoryObj } from '@storybook/react';
import FeelynxLogo from '@/components/brand/FeelynxLogo';

const meta: Meta<typeof FeelynxLogo> = {
  title: 'Brand/FeelynxLogo',
  component: FeelynxLogo,
  parameters: {
    backgrounds: {
      default: 'ink',
      values: [
        { name: 'ink', value: '#0B0720' },
        { name: 'light', value: '#f6f6ff' },
      ],
    },
    docs: {
      description: {
        component:
          'Feelynx neon wordmark with optional glow. Use at 24px height or larger for navigation and hero placements.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 80, max: 480, step: 20 },
    },
    glow: {
      control: 'boolean',
    },
    tagline: {
      control: 'text',
    },
  },
  args: {
    size: 260,
    glow: true,
    tagline: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof FeelynxLogo>;

export const Default: Story = {};

export const Glowless: Story = {
  args: {
    glow: false,
  },
};

export const WithTagline: Story = {
  args: {
    tagline: 'Feel. Connect. Sync.',
  },
};

export const HoverPulse: Story = {
  render: (args) => (
    <div className="group inline-flex flex-col items-center gap-4">
      <div className="rounded-3xl bg-[#0B0720] p-6 transition-shadow duration-300 group-hover:shadow-[0_0_45px_rgba(232,51,139,0.45)]">
        <FeelynxLogo {...args} />
      </div>
      <p className="text-sm text-white/70">Hover to preview the active glow state.</p>
    </div>
  ),
};
