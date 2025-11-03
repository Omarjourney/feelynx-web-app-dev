// If you encounter type errors for 'next/og', ensure you have the correct Next.js types installed or configure TypeScript accordingly.

// @ts-ignore - suppress "Cannot find module 'next/og'" in environments without Next.js types
import { ImageResponse } from 'next/og';
export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Feelynx';
  const tagline = searchParams.get('tagline') ?? 'Feel the vibe. Live the show.';
  const mode = searchParams.get('theme') ?? 'dark';

  const bg = mode === 'light' ? '#F6F8FB' : '#0B0720';
  const textGradient =
    mode === 'light'
      ? 'linear-gradient(90deg, #0062FF, #00B9FF)'
      : 'linear-gradient(90deg, #00E5FF, #4D7CFF)';
  const stroke = mode === 'light' ? '#5B7FE6' : '#0A183C';
  const textColor = mode === 'light' ? '#102043' : '#C7D6FF';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: bg,
          fontFamily: 'Bangers, Impact, system-ui, sans-serif',
        }}
      >
        <h1
          style={{
            fontSize: 160,
            fontWeight: 900,
            color: 'transparent',
            backgroundImage: textGradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextStroke: `6px ${stroke}`,
            marginBottom: 10,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 48,
            color: textColor,
            opacity: 0.9,
            letterSpacing: 2,
          }}
        >
          {tagline}
        </p>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
