import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "50";

    const backendRes = await fetch(`/api/preview-processed?limit=${limit}`, {
        cache: 'no-store'
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
