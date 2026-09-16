process.env.HOSTNAME = '127.0.0.1';
process.env.PORT = '3006';
import('./server.js').catch(() => {
  console.error('suchay.dev runtime failed to start.');
  process.exitCode = 1;
});
