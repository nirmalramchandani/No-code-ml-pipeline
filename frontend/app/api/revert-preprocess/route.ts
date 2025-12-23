import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const backendRes = await fetch("/api/revert-preprocess", {
      method: "POST",
    });

    if (!backendRes.ok) {
        const error = await backendRes.json();
        return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
