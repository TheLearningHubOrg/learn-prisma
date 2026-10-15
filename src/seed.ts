import { prisma } from './db.js';

async function main() {
  console.log('[learn-prisma] Seeding initial database records...');

  const user = await prisma.user.create({
    email: 'developer@learninghub.org',
    name: 'Full Stack Engineer',
    role: 'STUDENT'
  });

  const post = await prisma.post.create({
    title: 'Zero-Downtime Prisma Migrations in CI/CD',
    content: 'Step-by-step guide to shadow databases and expand-contract migrations',
    authorId: user.id
  });

  console.log('[learn-prisma] Seed complete! User created:', user.name, 'Post created:', post.title);
}

main().catch(console.error);
