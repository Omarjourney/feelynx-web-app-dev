import { ImageResponse } from 'next/og';
export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'Feelynx';
  const tagline = searchParams.get('tagline') ?? 'Feel. Connect. Sync.';
  const mode = searchParams.get('theme') ?? 'dark';

  const bg = mode === 'light' ? '#F6F8FB' : '#0B0720';
  const textGradient =
    mode === 'light'
      ? 'linear-gradient(90deg, #FF4FD8, #0077FF)'
      : 'linear-gradient(90deg, #E8338B, #5CC8FF)';
  const stroke = mode === 'light' ? '#A2B4D0' : '#1B1230';
  const textColor = mode === 'light' ? '#0A0A0A' : '#EAE9FF';

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
