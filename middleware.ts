import { NextRequest, NextResponse } from "next/server";

const ROTAS_PUBLICAS = ["/login", "/acesso", "/portal", "/mentorada/acolhimento"];

// Rotas estáticas e internas que nunca precisam de verificação
const SKIP_PREFIXES = ["/_next", "/favicon", "/bw1", "/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora arquivos estáticos e rotas internas
  if (SKIP_PREFIXES.some(p => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Ignora extensões de arquivo (imagens, fontes, etc.)
  if (/\.(ico|jpg|jpeg|png|svg|gif|webp|woff|woff2|ttf|otf|css|js|map)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Rotas públicas sempre passam
  if (ROTAS_PUBLICAS.some(r => pathname.startsWith(r))) {
    return addSecurityHeaders(NextResponse.next());
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

function addSecurityHeaders(res: NextResponse): NextResponse {
  // Impede que o portal seja embarcado em iframes de outros domínios
  res.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Impede que o browser "adivinhe" o tipo de conteúdo
  res.headers.set("X-Content-Type-Options", "nosniff");

  // Controla informações enviadas ao referrer
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Desativa funcionalidades sensíveis que o portal não usa
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // Remove informações sobre a tecnologia usada
  res.headers.delete("X-Powered-By");

  // Em produção: força HTTPS por 1 ano
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
