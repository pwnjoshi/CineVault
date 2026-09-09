const { spawn } = require('child_process');

const API_PORT = process.env.INTERNAL_API_PORT || '5000';
const PORT = process.env.PORT || '4000';

console.log('[CineVault] Starting Express API server on internal port ' + API_PORT + '...');
const server = spawn(process.execPath, ['server/dist/index.js'], {
  env: Object.assign({}, process.env, { PORT: API_PORT }),
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('[CineVault Server Error]:', err);
});

console.log('[CineVault] Starting Next.js frontend on port ' + PORT + '...');
const nextBin = require.resolve('next/dist/bin/next');
const nextApp = spawn(process.execPath, [nextBin, 'start', '-p', PORT], {
  env: Object.assign({}, process.env, { PORT: PORT, INTERNAL_API_PORT: API_PORT }),
  stdio: 'inherit'
});

nextApp.on('error', (err) => {
  console.error('[CineVault Next Error]:', err);
});

function shutdown() {
  console.log('[CineVault] Gracefully shutting down services...');
  server.kill('SIGTERM');
  nextApp.kill('SIGTERM');
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
