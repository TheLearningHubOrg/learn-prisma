import http from 'node:http';
import { prisma } from './db.js';

export function createServer(): http.Server {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const json = (data: unknown, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
    };

    // 1. Health
    if (url.pathname === '/health' && req.method === 'GET') {
      const mem = process.memoryUsage();
      return json({
        status: 'healthy',
        orm: 'Prisma Client v6',
        memoryUsageMb: Math.round(mem.heapUsed / 1024 / 1024),
        uptimeSeconds: Math.round(process.uptime())
      });
    }

    // 2. GET /api/v1/users
    if (url.pathname === '/api/v1/users' && req.method === 'GET') {
      const users = await prisma.user.findMany();
      return json({ success: true, data: users, count: users.length });
    }

    // 3. POST /api/v1/users
    if (url.pathname === '/api/v1/users' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body);
          if (!parsed.email || !parsed.name) {
            return json({ success: false, error: 'Email and name are required' }, 400);
          }
          const user = await prisma.user.create(parsed);
          return json({ success: true, data: user }, 201);
        } catch {
          return json({ success: false, error: 'Malformed JSON payload' }, 400);
        }
      });
      return;
    }

    // 4. GET /api/v1/posts (Cursor pagination support)
    if (url.pathname === '/api/v1/posts' && req.method === 'GET') {
      const cursor = url.searchParams.get('cursor');
      const take = Number(url.searchParams.get('take')) || 10;
      const posts = await prisma.post.findMany({
        cursor: cursor ? { id: cursor } : undefined,
        take: take + 1 // Take + 1 pattern for hasNextPage
      });

      const hasNextPage = posts.length > take;
      const items = hasNextPage ? posts.slice(0, -1) : posts;
      const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

      return json({
        success: true,
        data: items,
        pagination: {
          take,
          hasNextPage,
          nextCursor
        }
      });
    }

    // 5. GET /api/v1/roadmap
    if (url.pathname === '/api/v1/roadmap' && req.method === 'GET') {
      const stages = await prisma.curriculumStage.findMany();
      return json({ success: true, data: stages });
    }

    return json({ success: false, error: 'Route not found' }, 404);
  });
}
