import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse("認証が必要です", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="聖教データベース"',
      },
    });
  }

  const [scheme, encoded] = authHeader.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return new NextResponse("認証形式が無効です", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="聖教データベース"',
      },
    });
  }

  const decoded = atob(encoded);
  const [username, password] = decoded.split(":");

  const validUsername = process.env.AUTH_USERNAME || "admin";
  const validPassword = process.env.AUTH_PASSWORD || "password";

  if (username !== validUsername || password !== validPassword) {
    return new NextResponse("認証情報が無効です", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="聖教データベース"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
