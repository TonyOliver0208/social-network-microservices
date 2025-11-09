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
  console.log('Creating tags and test posts with tags...');
  
  // Use the actual authenticated user ID from your logs
  const userId = 'bdeec3f5-7139-4a71-b168-c085e017386b';
  
  // First, create tags if they don't exist
  const tagNames = ['javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'microservices', 'authentication', 'prisma', 'database', 'api'];
  const tagDescriptions = {
    javascript: 'JavaScript programming language',
    typescript: 'TypeScript - JavaScript with syntax for types',
    react: 'React - A JavaScript library for building user interfaces',
    nextjs: 'Next.js - The React Framework for Production',
    nodejs: 'Node.js - JavaScript runtime built on Chrome\'s V8',
    microservices: 'Microservices architecture and patterns',
    authentication: 'User authentication and authorization',
    prisma: 'Prisma - Next-generation Node.js and TypeScript ORM',
    database: 'Database design and management',
    api: 'API design and development'
  };

  const tags = {};
  for (const tagName of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName,
        description: tagDescriptions[tagName] || `${tagName} related topics`,
      },
    });
    tags[tagName] = tag;
    console.log('✅ Tag created/found:', tag.name);
  }
  
  // Now create posts with tags
  const postsData = [
    {
      content: 'How do I implement authentication in Next.js 14?\n\nI\'m working on a new project and need to add user authentication. What are the best practices for implementing auth in Next.js 14 with App Router?\n\nI\'ve heard about NextAuth.js and other solutions, but I\'m not sure which approach is best for my use case.',
      tags: ['nextjs', 'authentication', 'javascript', 'react'],
    },
    {
      content: 'Best practices for microservices architecture?\n\nI\'m building a scalable application using microservices. What are some best practices I should follow for service communication, data management, and deployment?\n\nSpecifically interested in gRPC vs REST and database per service patterns.',
      tags: ['microservices', 'nodejs', 'api', 'database'],
    },
    {
      content: 'React Query vs SWR - Which one should I use?\n\nI\'m trying to decide between React Query and SWR for data fetching in my React application. What are the pros and cons of each?\n\nMy project is using Next.js 14 with App Router.',
      tags: ['react', 'nextjs', 'javascript'],
    },
    {
      content: 'TypeScript generic constraints - Help needed!\n\nI\'m struggling with TypeScript generic constraints. How do I properly constrain a generic type to ensure type safety while maintaining flexibility?\n\nHere\'s what I\'m trying to do: [code example here]',
      tags: ['typescript', 'javascript'],
    },
    {
      content: 'Prisma migration issues with PostgreSQL\n\nI\'m having trouble running Prisma migrations in my development environment. The migration hangs and never completes.\n\nHas anyone experienced this? What could be causing it?',
      tags: ['prisma', 'database', 'nodejs', 'typescript'],
    },
    {
      content: 'Best way to handle file uploads in Node.js?\n\nI need to implement file upload functionality in my Node.js API. What are the best practices for handling file uploads, validation, and storage?\n\nShould I use multer, or are there better alternatives?',
      tags: ['nodejs', 'api', 'javascript'],
    },
    {
      content: 'How to optimize React performance?\n\nMy React application is getting slow as it grows. What are the key techniques for optimizing React performance?\n\nI\'ve heard about useMemo, useCallback, and React.memo, but when should I use each?',
      tags: ['react', 'javascript', 'typescript'],
    },
    {
      content: 'Understanding Next.js Server Components\n\nCan someone explain the difference between Server Components and Client Components in Next.js 14?\n\nWhen should I use each, and how do they affect my application\'s performance?',
      tags: ['nextjs', 'react', 'javascript'],
    },
  ];
  
  for (const postData of postsData) {
    // Create the post
    const post = await prisma.post.create({
      data: {
        content: postData.content,
        authorId: userId,
        privacy: 'PUBLIC',
        mediaUrls: [],
      },
    });
    
    // Create PostTag relationships
    for (const tagName of postData.tags) {
      await prisma.postTag.create({
        data: {
          postId: post.id,
          tagId: tags[tagName].id,
        },
      });
    }
    
    console.log('✅ Post created with tags:', post.id, '-', postData.content.split('\n')[0]);
    console.log('   Tags:', postData.tags.join(', '));
  }
  
  console.log('\n🎉 All test posts with tags created successfully!');
  
  // Show summary
  const totalPosts = await prisma.post.count();
  const totalTags = await prisma.tag.count();
  const totalPostTags = await prisma.postTag.count();
  
  console.log('\n📊 Database Summary:');
  console.log(`   Total Posts: ${totalPosts}`);
  console.log(`   Total Tags: ${totalTags}`);
  console.log(`   Total Post-Tag Relations: ${totalPostTags}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
