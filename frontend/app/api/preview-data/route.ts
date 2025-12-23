import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "50";

    const backendRes = await fetch(`/api/preview-data?limit=${limit}`, {
        cache: 'no-store' 
    });

    if (!backendRes.ok) {
        // Handle 400/500 from backend
        const error = await backendRes.text();
        try {
            return NextResponse.json(JSON.parse(error), { status: backendRes.status });
        } catch {
            return NextResponse.json({ detail: error }, { status: backendRes.status });
        }
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
