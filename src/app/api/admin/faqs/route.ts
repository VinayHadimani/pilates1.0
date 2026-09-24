import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET (admin only): list all FAQ entries (active + inactive).
 */
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const faqs = await db.faqEntry.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ faqs });
}

/**
 * POST (admin only): create a new FAQ entry.
 * Accepts { question, answer, sortOrder, isActive }
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as any;
    const question = String(b.question || "").trim();
    const answer = String(b.answer || "").trim();
    if (!question || !answer) {
      return NextResponse.json(
        { error: "question and answer are required" },
        { status: 400 }
      );
    }

    const data = {
      question,
      answer,
      sortOrder:
        b.sortOrder !== undefined && b.sortOrder !== null
          ? Number(b.sortOrder)
          : 0,
      isActive: b.isActive === undefined ? true : Boolean(b.isActive),
    };

    const faq = await db.faqEntry.create({ data });
    return NextResponse.json({ ok: true, faq });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
