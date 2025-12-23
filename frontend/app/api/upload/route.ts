import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Forward to FastAPI
    const backendRes = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData, // fetch automatically sets multipart headers if body is FormData
    });

    if (!backendRes.ok) {
        const error = await backendRes.json();
        return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
