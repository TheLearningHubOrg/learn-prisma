import { createServer } from './server.js';

const port = Number(process.env.PORT) || 3000;
const server = createServer();

server.listen(port, () => {
  console.log(`[learn-prisma] Server running on http://localhost:${port}`);
  console.log(`[learn-prisma] Users API: http://localhost:${port}/api/v1/users`);
  console.log(`[learn-prisma] Posts API: http://localhost:${port}/api/v1/posts`);
  console.log(`[learn-prisma] 7-Stage Roadmap: http://localhost:${port}/api/v1/roadmap`);
});
