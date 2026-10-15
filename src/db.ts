import type { User, Post, CurriculumStage } from './types.js';

// In-memory relational storage layer simulating Prisma Client operations
class PrismaStore {
  private users = new Map<string, User>();
  private posts = new Map<string, Post>();
  private stages = new Map<number, CurriculumStage>();

  constructor() {
    this.seed();
  }

  private seed() {
    this.users.set('user_1', {
      id: 'user_1',
      email: 'ada@learninghub.org',
      name: 'Ada Lovelace',
      role: 'ARCHITECT',
      createdAt: new Date().toISOString()
    });

    this.posts.set('post_1', {
      id: 'post_1',
      title: 'Prisma Rust Query Engine & Connection Pools',
      content: 'Detailed analysis of query engine binaries and connection pooling',
      published: true,
      authorId: 'user_1',
      createdAt: new Date().toISOString()
    });

    const roadmapData: Array<{ id: number; title: string; domainFocus: string }> = [
      { id: 1, title: 'Prisma Schema DSL & Data Modeling', domainFocus: 'Models, attributes, relations, custom scalar mapping' },
      { id: 2, title: 'Prisma Client CRUD & Relational Filtering', domainFocus: 'Fluent API, nested writes, includes, selects' },
      { id: 3, title: 'Prisma Migrate & Schema Evolution', domainFocus: 'Shadow databases, baseline migrations, drift detection' },
      { id: 4, title: 'Transactions, Concurrency & Locking', domainFocus: 'Interactive transactions, isolation levels, optimistic locks' },
      { id: 5, title: 'High-Performance Pagination & Indexing', domainFocus: 'Cursor vs offset pagination, compound indexes' },
      { id: 6, title: 'Prisma Accelerate & Edge Deployments', domainFocus: 'Connection pooling, edge cache caching, serverless' },
      { id: 7, title: 'Staff Architect Interview Handbook', domainFocus: '50 staff scenarios, connection exhaustion, disaster recovery' }
    ];

    roadmapData.forEach((s) => {
      this.stages.set(s.id, {
        id: s.id,
        title: s.title,
        domainFocus: s.domainFocus,
        completed: s.id <= 2,
        createdAt: new Date().toISOString()
      });
    });
  }

  // User Operations
  user = {
    findMany: async (): Promise<User[]> => Array.from(this.users.values()),
    findUnique: async (where: { id?: string; email?: string }): Promise<User | null> => {
      if (where.id) return this.users.get(where.id) || null;
      if (where.email) {
        return Array.from(this.users.values()).find((u) => u.email === where.email) || null;
      }
      return null;
    },
    create: async (data: { email: string; name: string; role?: string }): Promise<User> => {
      const id = `user_${Date.now()}`;
      const user: User = {
        id,
        email: data.email,
        name: data.name,
        role: data.role || 'STUDENT',
        createdAt: new Date().toISOString()
      };
      this.users.set(id, user);
      return user;
    }
  };

  // Post Operations
  post = {
    findMany: async (args?: { cursor?: { id: string }; take?: number }): Promise<Array<Post & { author?: User }>> => {
      let all = Array.from(this.posts.values());
      if (args?.cursor?.id) {
        const index = all.findIndex((p) => p.id === args.cursor?.id);
        if (index !== -1) all = all.slice(index);
      }
      if (args?.take) {
        all = all.slice(0, args.take);
      }
      return all.map((post) => ({
        ...post,
        author: this.users.get(post.authorId)
      }));
    },
    create: async (data: { title: string; content?: string; authorId: string }): Promise<Post> => {
      const id = `post_${Date.now()}`;
      const post: Post = {
        id,
        title: data.title,
        content: data.content,
        published: true,
        authorId: data.authorId,
        createdAt: new Date().toISOString()
      };
      this.posts.set(id, post);
      return post;
    }
  };

  // Stage Operations
  curriculumStage = {
    findMany: async (): Promise<CurriculumStage[]> => Array.from(this.stages.values()),
    findUnique: async (id: number): Promise<CurriculumStage | null> => this.stages.get(id) || null
  };

  // Transaction simulation
  $transaction = async <T>(fn: (tx: PrismaStore) => Promise<T>): Promise<T> => {
    return fn(this);
  };
}

export const prisma = new PrismaStore();
