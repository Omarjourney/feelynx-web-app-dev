import IvibesLogo from '../components/brand/IvibesLogo';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof IvibesLogo> = {
  title: 'Brand/IvibesLogo',
  component: IvibesLogo,
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0B0720' },
        { name: 'light', value: '#F6F8FB' },
      ],
    },
  },
  argTypes: {
    size: { control: { type: 'range', min: 100, max: 600 } },
    glow: { control: 'boolean' },
    tagline: { control: 'text' },
    theme: { control: 'radio', options: ['auto', 'dark', 'light'] },
  },
};

export default meta;
type Story = StoryObj<typeof IvibesLogo>;

export const Default: Story = { args: { size: 400, glow: true, theme: 'dark' } };
export const LightMode: Story = { args: { size: 400, glow: false, theme: 'light' } };
export const WithTagline: Story = {
  args: { size: 420, glow: true, tagline: 'Feel the vibe. Live the show.' },
};
