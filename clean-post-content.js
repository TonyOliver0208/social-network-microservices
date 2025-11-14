/**
 * Script to clean existing post content by removing brackets around images
 * Run this once to clean up existing database content
 */

const { PrismaClient } = require('./node_modules/.prisma/client-post');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POST_DATABASE_URL || 'postgresql://postgres:password@localhost:5434/devcoll_post?schema=public'
    }
  }
});

/**
 * Clean HTML content by removing bracket artifacts around images and links
 */
function cleanHtmlContent(html) {
  if (!html) return html;
  
  let cleaned = html;
  
  // Remove brackets around <img> tags
  cleaned = cleaned.replace(/\[\s*(<img[^>]*>)\s*\]/gi, '$1');
  cleaned = cleaned.replace(/\[\s*(<img[^>]*\/>)\s*\]/gi, '$1');
  
  // Remove [ before <img> or <a> tags (image placeholders)
  cleaned = cleaned.replace(/\[\s*(<img)/gi, '$1');
  cleaned = cleaned.replace(/\[\s*(<a[^>]*class="[^"]*image-placeholder[^"]*")/gi, '$1');
  
  // Remove ] after </a> tags that have image-placeholder class
  cleaned = cleaned.replace(/(<a[^>]*class="[^"]*image-placeholder[^"]*"[^>]*>[^<]*<\/a>)\s*\]/gi, '$1');
  
  // Remove ] after <img> tags
  cleaned = cleaned.replace(/(<\/img>)\s*\]/gi, '$1');
  cleaned = cleaned.replace(/(<img[^>]*\/>)\s*\]/gi, '$1');
  
  // Remove standalone brackets (only single [ or ] surrounded by spaces)
  cleaned = cleaned.replace(/\s\[\s/g, ' ');
  cleaned = cleaned.replace(/\s\]\s/g, ' ');
  
  return cleaned;
}

async function main() {
  console.log('🔍 Fetching posts with content...');
  
  // Get all posts
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      content: true
    }
  });
  
  console.log(`📊 Found ${posts.length} posts`);
  
  let updatedCount = 0;
  let cleanedCount = 0;
  
  for (const post of posts) {
    if (!post.content) continue;
    
    const originalContent = post.content;
    const cleanedContent = cleanHtmlContent(originalContent);
    
    // Only update if content changed
    if (originalContent !== cleanedContent) {
      await prisma.post.update({
        where: { id: post.id },
        data: { content: cleanedContent }
      });
      
      updatedCount++;
      cleanedCount++;
      console.log(`✅ Cleaned post ID: ${post.id}`);
      console.log(`   Before: ${originalContent.substring(0, 150)}...`);
      console.log(`   After:  ${cleanedContent.substring(0, 150)}...`);
      console.log();
    }
  }
  
  console.log(`\n✨ Done! Updated ${updatedCount} out of ${posts.length} posts`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
