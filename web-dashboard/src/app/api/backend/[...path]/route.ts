// ============================================
// Next.js API Route - API Backend Proxy
// ============================================
// Meneruskan semua request /api/v1/* ke backend URL
// yang dikonfigurasi via BACKEND_INTERNAL_URL env var

import { NextRequest, NextResponse } from "next/server";

async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const apiPath = path ? path.join("/") : "";

  // URL backend Express (Railway, Render, VPS, dll)
  const backendUrl = process.env.BACKEND_INTERNAL_URL;

  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Backend belum dikonfigurasi. Harap set environment variable BACKEND_INTERNAL_URL di Vercel dashboard.",
        hint: "Masuk ke Vercel → Project Settings → Environment Variables → tambahkan BACKEND_INTERNAL_URL=https://url-backend-anda.com",
      },
      { status: 503 }
    );
  }

  const base = backendUrl.replace(/\/+$/, "");
  const targetUrl = `${base}/api/v1/${apiPath}`;
  const searchParams = req.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (!["host", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = req.body; // Forward the exact stream
    }

    const fetchOptions: RequestInit & { duplex?: string } = {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    };

    if (body) {
      fetchOptions.duplex = 'half'; // Required by Node fetch when body is a stream
    }

    const response = await fetch(fullUrl, fetchOptions);

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
        "X-Proxied-By": "E-Komite-Pintar-Next",
      },
    });
  } catch (error) {
    console.error("API Proxy error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghubungi backend.",
        error: errMsg,
      },
      { status: 502 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}