const { PrismaClient } = require('../../../node_modules/.prisma/client-post');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Popular programming tags
  const tags = [
    {
      name: 'javascript',
      description: 'For questions about programming in ECMAScript (JavaScript/JS) and its different dialects/implementations. Questions about frameworks like React, Angular, Vue.js should include relevant framework tags.',
    },
    {
      name: 'python',
      description: 'Python is a dynamically typed, multi-purpose programming language designed to be quick to learn, understand, and use, with a clean and expressive syntax.',
    },
    {
      name: 'react',
      description: 'React is a JavaScript library for building user interfaces. It uses a declarative, component-based approach and can be used to develop single-page, mobile, or server-rendered applications.',
    },
    {
      name: 'typescript',
      description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing and class-based object-oriented programming to the language.',
    },
    {
      name: 'nodejs',
      description: 'Node.js is an event-based, non-blocking, asynchronous I/O runtime that uses Google\'s V8 JavaScript engine and libuv library. It is used for developing applications that make heavy use of the ability to run JavaScript both on the client and server side.',
    },
    {
      name: 'java',
      description: 'Java is a high-level object-oriented programming language. Use this tag when you\'re having problems using or understanding the language itself.',
    },
    {
      name: 'nextjs',
      description: 'Next.js is a React framework for building full-stack web applications. It provides features like server-side rendering, static site generation, and API routes.',
    },
    {
      name: 'css',
      description: 'CSS (Cascading Style Sheets) is a language used to describe the presentation and styling of HTML documents. Use this tag for questions about CSS syntax, properties, and styling techniques.',
    },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
    console.log(`✅ Created/updated tag: ${tag.name}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
