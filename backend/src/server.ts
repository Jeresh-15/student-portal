import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`===============================================`);
  console.log(`🎓 College LMS Student Module Backend Running`);
  console.log(`📡 URL: http://localhost:${env.PORT}`);
  console.log(`🩺 Health: http://localhost:${env.PORT}/api/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
