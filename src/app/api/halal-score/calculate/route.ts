import { NextRequest, NextResponse } from "next/server";
import { calculateHalalScore } from "@/lib/halal-score";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = await request.json();
    const result = calculateHalalScore(input);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid calculation input" }, { status: 400 });
  }
}
