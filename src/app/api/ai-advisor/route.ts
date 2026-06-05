import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { askAdvisor } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, user_context } = await request.json();

  if (!question || question.trim().length === 0) {
    return NextResponse.json({ error: "Question required" }, { status: 400 });
  }

  try {
    const response = await askAdvisor(question, user_context);
    return NextResponse.json({ response });
  } catch {
    // Fallback mode jika Claude API down
    return NextResponse.json({
      response: "Maaf, AI Advisor sedang tidak tersedia. Silakan coba lagi nanti. 🙏",
      fallback: true,
    });
  }
}
