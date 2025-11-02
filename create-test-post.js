const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/post_db?schema=public'
    }
  }
});

async function main() {
  console.log('Creating test post...');
  
  const post = await prisma.post.create({
    data: {
      content: 'This is a test post to verify the feed is working correctly!',
      authorId: 'test-user-123',
      privacy: 'PUBLIC',
      mediaUrls: [],
    },
  });
  
  console.log('Test post created:', post);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
