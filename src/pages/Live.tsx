import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { LiveStream, LiveExperienceHUD } from '@/components/live';
import LiveEarningsTicker from '@/components/live/LiveEarningsTicker';
import useLiveExperienceTelemetry from '@/features/live/useLiveExperienceTelemetry';
import { useEmotionUI } from '@/hooks/useEmotionUI';

const Live = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const creators = useCreatorLive();
  const creator = creators.find((c) => c.username === username);
  const initialViewers = creator?.viewers ?? 320;
  const telemetry = useLiveExperienceTelemetry({
    creatorId: username ?? 'unknown-creator',
    initialViewers,
    enabled: Boolean(creator),
  });
  const { metrics, suggestions, isLive, cameraOn, goLive, endSession, toggleCamera } = telemetry;
  const viewerCount = useMemo(() => Math.max(0, Math.round(metrics.viewerCount)), [metrics.viewerCount]);
  const emotion = useEmotionUI({
    sentimentScore: metrics.sentimentScore,
    engagementRate: metrics.engagementRate,
    tokensPerMinute: metrics.tokensPerMinute,
    viewerCount,
  });

  if (!creator) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border/60 bg-background/80 p-6 text-center text-sm text-muted-foreground">
          We couldn't find that creator. They may have gone offline.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-[background-image,filter] duration-700" style={emotion.cssVariables}>
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-5xl px-4 pt-10">
          <LiveExperienceHUD
            viewerCount={viewerCount}
            peakViewers={metrics.peakViewers}
            tokenTotal={metrics.tokenTotal}
            tokensPerMinute={metrics.tokensPerMinute}
            latencyMs={metrics.latencyMs}
            engagementRate={metrics.engagementRate}
            sentimentScore={metrics.sentimentScore}
            sessionStart={metrics.sessionStart}
            suggestions={suggestions}
            isLive={isLive}
            cameraOn={cameraOn}
            onGoLive={goLive}
            onEnd={endSession}
            onToggleCamera={toggleCamera}
          />
        </div>
        <div className="mx-auto mt-6 w-full max-w-4xl px-4">
          <LiveEarningsTicker
            tokenEarnings={metrics.tokenTotal}
            startTime={metrics.sessionStart}
            peakViewers={metrics.peakViewers}
            tone={emotion.tone}
            glassStyles={emotion.glassSurfaceStyle}
          />
        </div>
        <LiveStream
          creatorName={creator.name}
          viewers={viewerCount}
          onBack={() => navigate(-1)}
          emotion={emotion}
        />
      </main>
    </div>
  );
};

export default Live;
