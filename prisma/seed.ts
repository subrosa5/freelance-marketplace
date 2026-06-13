import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const password = await bcrypt.hash("password123", 12);

  // Freelancers
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Morgan",
      email: "alice@example.com",
      password,
      role: "FREELANCER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      bio: "Senior UI/UX designer with 6 years of experience. Specializing in SaaS products and mobile apps.",
      skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
      rating: 4.9,
      reviewCount: 47,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Chen",
      email: "bob@example.com",
      password,
      role: "FREELANCER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      bio: "Full-stack developer. React, Node.js, PostgreSQL. Built 30+ production apps.",
      skills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL"],
      rating: 4.8,
      reviewCount: 62,
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: "carol@example.com" },
    update: {},
    create: {
      name: "Carol Davis",
      email: "carol@example.com",
      password,
      role: "FREELANCER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
      bio: "Content writer & copywriter. SEO expert. Worked with 100+ brands worldwide.",
      skills: ["Copywriting", "SEO", "Blog Writing", "Email Marketing"],
      rating: 4.7,
      reviewCount: 89,
    },
  });

  const dan = await prisma.user.upsert({
    where: { email: "dan@example.com" },
    update: {},
    create: {
      name: "Dan Kim",
      email: "dan@example.com",
      password,
      role: "FREELANCER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dan",
      bio: "Digital marketing strategist. Google & Meta Ads certified. 5x ROAS average.",
      skills: ["Google Ads", "Meta Ads", "SEO", "Analytics"],
      rating: 4.6,
      reviewCount: 34,
    },
  });

  const eva = await prisma.user.upsert({
    where: { email: "eva@example.com" },
    update: {},
    create: {
      name: "Eva Russo",
      email: "eva@example.com",
      password,
      role: "FREELANCER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eva",
      bio: "Video editor & motion designer. YouTube, TikTok, corporate video. Adobe Premiere & After Effects.",
      skills: ["Video Editing", "Motion Graphics", "After Effects", "Color Grading"],
      rating: 4.9,
      reviewCount: 28,
    },
  });

  const frank = await prisma.user.upsert({
    where: { email: "frank@example.com" },
    update: {},
    create: {
      name: "Frank Weber",
      email: "frank@example.com",
      password,
      role: "FREELANCER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=frank",
      bio: "Business consultant & pitch deck specialist. Helped 50+ startups raise funding.",
      skills: ["Business Strategy", "Pitch Decks", "Financial Modeling", "Market Research"],
      rating: 4.8,
      reviewCount: 19,
    },
  });

  // Gigs — Design
  await prisma.gig.createMany({
    skipDuplicates: true,
    data: [
      {
        freelancerId: alice.id,
        title: "I will design a modern UI/UX for your web app",
        description: "Professional UI/UX design for your web application using Figma. Includes wireframes, high-fidelity mockups, interactive prototype, and a full design system with components.\n\nWhat you get:\n- Up to 10 screens\n- Desktop + Mobile responsive\n- Figma source file\n- 2 revision rounds\n- Style guide (colors, fonts, spacing)",
        category: "DESIGN",
        price: 14900,
        deliveryDays: 5,
        images: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80"],
        tags: ["ui design", "ux", "figma", "web design", "mobile"],
        isPublished: true,
        orderCount: 23,
      },
      {
        freelancerId: alice.id,
        title: "I will create a professional logo and brand identity",
        description: "Complete brand identity package for your business. From concept to final files, I'll create a unique logo that stands out.\n\nDeliverables:\n- 3 logo concepts\n- Final logo in SVG, PNG, PDF\n- Brand color palette\n- Typography selection\n- Business card design\n- Unlimited revisions until satisfied",
        category: "DESIGN",
        price: 9900,
        deliveryDays: 4,
        images: ["https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&q=80"],
        tags: ["logo", "branding", "brand identity", "logo design"],
        isPublished: true,
        orderCount: 41,
      },
    ],
  });

  // Gigs — Development
  await prisma.gig.createMany({
    skipDuplicates: true,
    data: [
      {
        freelancerId: bob.id,
        title: "I will build a full-stack Next.js web application",
        description: "Production-ready Next.js app with TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL. Deployed on Vercel.\n\nIncludes:\n- Next.js 14 App Router\n- Authentication (JWT or NextAuth)\n- Database integration (PostgreSQL / MySQL)\n- REST API or tRPC\n- Responsive design\n- CI/CD pipeline\n- Unit tests",
        category: "DEVELOPMENT",
        price: 49900,
        deliveryDays: 14,
        images: ["https://images.unsplash.com/photo-1555066931-4365d14431b9?w=800&q=80"],
        tags: ["nextjs", "react", "typescript", "fullstack", "web development"],
        isPublished: true,
        orderCount: 17,
      },
      {
        freelancerId: bob.id,
        title: "I will fix bugs and improve your React or Next.js app",
        description: "Stuck with a bug? Performance issues? Need a quick feature? I'll jump into your codebase and get it done.\n\nI work with:\n- React / Next.js\n- TypeScript / JavaScript\n- Node.js / Express\n- PostgreSQL / MongoDB\n- Tailwind CSS\n\nSend me your repo and describe the issue.",
        category: "DEVELOPMENT",
        price: 7900,
        deliveryDays: 2,
        images: ["https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80"],
        tags: ["bug fix", "react", "nextjs", "debugging", "javascript"],
        isPublished: true,
        orderCount: 38,
      },
      {
        freelancerId: bob.id,
        title: "I will build a REST API with Node.js and Express",
        description: "Scalable and secure REST API built with Node.js, Express, and PostgreSQL. Includes authentication, rate limiting, and full documentation.\n\nFeatures:\n- JWT Authentication\n- CRUD endpoints\n- Input validation (Zod)\n- Rate limiting\n- Swagger/OpenAPI docs\n- Docker-ready",
        category: "DEVELOPMENT",
        price: 29900,
        deliveryDays: 7,
        images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80"],
        tags: ["api", "nodejs", "express", "backend", "rest api"],
        isPublished: true,
        orderCount: 12,
      },
    ],
  });

  // Gigs — Writing
  await prisma.gig.createMany({
    skipDuplicates: true,
    data: [
      {
        freelancerId: carol.id,
        title: "I will write SEO-optimized blog posts for your website",
        description: "High-quality, SEO-optimized blog posts that drive organic traffic. I research keywords, write engaging content, and optimize for Google.\n\nEach article includes:\n- Keyword research\n- Compelling title + meta description\n- 1500-2000 words\n- Internal & external links\n- Images suggestions\n- Plagiarism-free guarantee",
        category: "WRITING",
        price: 4900,
        deliveryDays: 3,
        images: ["https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"],
        tags: ["blog writing", "seo", "content writing", "copywriting"],
        isPublished: true,
        orderCount: 56,
      },
      {
        freelancerId: carol.id,
        title: "I will write compelling website copy that converts",
        description: "Conversion-focused website copy for landing pages, homepages, and product pages. Copy that speaks to your audience and drives action.\n\nIncludes:\n- Homepage copy\n- About page\n- Services/Product pages\n- Call-to-action optimization\n- 2 revision rounds",
        category: "WRITING",
        price: 8900,
        deliveryDays: 5,
        images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80"],
        tags: ["copywriting", "website copy", "landing page", "conversion"],
        isPublished: true,
        orderCount: 29,
      },
    ],
  });

  // Gigs — Marketing
  await prisma.gig.createMany({
    skipDuplicates: true,
    data: [
      {
        freelancerId: dan.id,
        title: "I will set up and manage your Google Ads campaign",
        description: "Professional Google Ads setup and management. I'll create campaigns that bring qualified traffic and maximize your ROI.\n\nIncludes:\n- Account audit\n- Campaign setup (Search + Display)\n- Keyword research\n- Ad copy writing (5 variations)\n- Conversion tracking\n- Monthly performance report",
        category: "MARKETING",
        price: 19900,
        deliveryDays: 5,
        images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"],
        tags: ["google ads", "ppc", "digital marketing", "sem"],
        isPublished: true,
        orderCount: 14,
      },
      {
        freelancerId: dan.id,
        title: "I will do a full SEO audit and create an action plan",
        description: "Comprehensive SEO audit covering technical SEO, on-page optimization, backlink profile, and competitor analysis.\n\nYou'll receive:\n- Technical SEO report\n- On-page optimization checklist\n- Backlink analysis\n- Competitor gap analysis\n- 90-day action plan\n- Priority quick wins",
        category: "MARKETING",
        price: 9900,
        deliveryDays: 4,
        images: ["https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80"],
        tags: ["seo audit", "seo", "digital marketing", "technical seo"],
        isPublished: true,
        orderCount: 21,
      },
    ],
  });

  // Gigs — Video
  await prisma.gig.createMany({
    skipDuplicates: true,
    data: [
      {
        freelancerId: eva.id,
        title: "I will edit your YouTube video professionally",
        description: "Professional YouTube video editing that keeps viewers engaged. I'll take your raw footage and turn it into a polished, high-retention video.\n\nIncludes:\n- Color grading\n- Sound design & music\n- Subtitles / captions\n- Transitions & effects\n- Thumbnail design\n- Up to 20 min raw footage",
        category: "VIDEO",
        price: 6900,
        deliveryDays: 3,
        images: ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80"],
        tags: ["video editing", "youtube", "content creator", "editing"],
        isPublished: true,
        orderCount: 33,
      },
      {
        freelancerId: eva.id,
        title: "I will create motion graphics and animated explainer video",
        description: "Eye-catching motion graphics and animated explainer videos for your product, app, or service. Perfect for landing pages, ads, and social media.\n\nDeliverables:\n- 60-90 second animated video\n- Voiceover (optional)\n- Script assistance\n- MP4 + web-optimized version\n- Source file (After Effects)",
        category: "VIDEO",
        price: 24900,
        deliveryDays: 7,
        images: ["https://images.unsplash.com/photo-1536240478700-b869ad10e269?w=800&q=80"],
        tags: ["motion graphics", "animation", "explainer video", "after effects"],
        isPublished: true,
        orderCount: 11,
      },
    ],
  });

  // Gigs — Business
  await prisma.gig.createMany({
    skipDuplicates: true,
    data: [
      {
        freelancerId: frank.id,
        title: "I will create an investor-ready pitch deck for your startup",
        description: "Compelling pitch decks that help startups raise funding. I've helped founders raise over $10M combined.\n\nIncludes:\n- 12-15 slide deck\n- Problem / Solution / Market slides\n- Financial projections\n- Team & Traction slides\n- Investor Q&A prep\n- PowerPoint + PDF delivery\n- 3 revision rounds",
        category: "BUSINESS",
        price: 34900,
        deliveryDays: 7,
        images: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"],
        tags: ["pitch deck", "startup", "investor", "fundraising", "presentation"],
        isPublished: true,
        orderCount: 8,
      },
      {
        freelancerId: frank.id,
        title: "I will write your business plan with financial projections",
        description: "Professional business plan for startups, SMEs, and entrepreneurs seeking investment or bank loans.\n\nIncludes:\n- Executive summary\n- Market analysis\n- Competitive landscape\n- Go-to-market strategy\n- 3-year financial projections\n- Risk analysis\n- 30-40 page document",
        category: "BUSINESS",
        price: 44900,
        deliveryDays: 10,
        images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"],
        tags: ["business plan", "financial projections", "startup", "business strategy"],
        isPublished: true,
        orderCount: 5,
      },
    ],
  });

  console.log("✅ Seed complete — 6 freelancers, 14 gigs");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
