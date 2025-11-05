// Use Prisma Client from post-service (generated at root node_modules)
const { PrismaClient } = require('./node_modules/.prisma/client-post');

// Use the correct database URL for post service
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POST_DATABASE_URL || 'postgresql://postgres:password@localhost:5434/devcoll_post?schema=public'
    }
  }
});

async function main() {
  console.log('Creating test posts...');
  
  // Use the actual authenticated user ID from your logs
  const userId = 'bdeec3f5-7139-4a71-b168-c085e017386b';
  
  const posts = [
    {
      content: 'How do I implement authentication in Next.js 14?\n\nI\'m working on a new project and need to add user authentication. What are the best practices for implementing auth in Next.js 14 with App Router?',
      authorId: userId,
      privacy: 'PUBLIC',
      mediaUrls: [],
    },
    {
      content: 'Best practices for microservices architecture?\n\nI\'m building a scalable application using microservices. What are some best practices I should follow for service communication, data management, and deployment?',
      authorId: userId,
      privacy: 'PUBLIC',
      mediaUrls: [],
    },
    {
      content: 'React Query vs SWR - Which one should I use?\n\nI\'m trying to decide between React Query and SWR for data fetching in my React application. What are the pros and cons of each?',
      authorId: userId,
      privacy: 'PUBLIC',
      mediaUrls: [],
    },
  ];
  
  for (const postData of posts) {
    const post = await prisma.post.create({
      data: postData,
    });
    console.log('✅ Test post created:', post.id, '-', postData.content.split('\n')[0]);
  }
  
  console.log('\n🎉 All test posts created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
