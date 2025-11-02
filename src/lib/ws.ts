export function getServerWsUrl(): string {
  const env = (import.meta as any).env?.VITE_SERVER_WS_URL as string | undefined;
  if (env) return env;
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = location.hostname;
  const defaultPort = location.protocol === 'https:' ? '' : '3001';
  const port = location.port || defaultPort;
  const hostPort = port ? `${host}:${port}` : host;
  return `${proto}//${hostPort}`;
}
