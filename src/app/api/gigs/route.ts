import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redis } from "@/lib/redis";

const createSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50),
  category: z.enum(["DESIGN", "DEVELOPMENT", "WRITING", "MARKETING", "VIDEO", "MUSIC", "BUSINESS", "OTHER"]),
  price: z.number().int().min(500).max(1000000), // cents
  deliveryDays: z.number().int().min(1).max(90),
  tags: z.array(z.string()).max(5).default([]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 12;
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const cacheKey = `gigs:${page}:${category}:${search}:${minPrice}:${maxPrice}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const where = {
    isPublished: true,
    ...(category ? { category: category as never } : {}),
    ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }] } : {}),
    ...(minPrice || maxPrice ? { price: { ...(minPrice ? { gte: Number(minPrice) } : {}), ...(maxPrice ? { lte: Number(maxPrice) } : {}) } } : {}),
  };

  const [gigs, total] = await Promise.all([
    prisma.gig.findMany({
      where,
      include: { freelancer: { select: { id: true, name: true, avatar: true, rating: true } } },
      orderBy: { orderCount: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gig.count({ where }),
  ]);

  const result = { gigs, total, pages: Math.ceil(total / limit) };
  await redis.setex(cacheKey, 60, result); // cache 60 seconds

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "FREELANCER") return NextResponse.json({ error: "Only freelancers can create gigs" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const gig = await prisma.gig.create({
    data: { ...parsed.data, freelancerId: user.id },
    include: { freelancer: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json(gig, { status: 201 });
}
