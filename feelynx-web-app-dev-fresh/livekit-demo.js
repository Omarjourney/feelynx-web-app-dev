async function startLiveKit() {
  const livekitClient = window.LivekitClient;
  if (!livekitClient) {
    throw new Error('LivekitClient global is unavailable.');
  }

  const { Room, createLocalTracks } = livekitClient;

  const response = await fetch('http://localhost:3000/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'alice', room: 'myRoom' }),
  });
  const { token } = await response.json();

  const room = new Room();
  await room.connect('wss://feelynxlive-rtnczet2.livekit.cloud', token, {
    autoSubscribe: true,
  });

  const localTracks = await createLocalTracks({
    audio: true,
    video: { width: 1280, height: 720 },
  });
  await room.localParticipant.publishTracks(localTracks);

  const localVideo = document.getElementById('localVideo');
  room.localParticipant.videoTracks.forEach((pub) => {
    const element = pub.track.attach();
    localVideo.appendChild(element);
  });

  const container = document.getElementById('remoteVideos');
  room.on('participantConnected', (participant) => {
    participant.on('trackSubscribed', (track) => {
      container.appendChild(track.attach());
    });
  });

  room.on('disconnected', () => {
    console.log('Disconnected from LiveKit');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  startLiveKit().catch((error) => {
    console.error('Failed to start LiveKit demo', error);
  });
});
