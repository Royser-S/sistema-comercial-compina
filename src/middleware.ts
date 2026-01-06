import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Preparamos la respuesta
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Creamos el cliente de Supabase para leer la cookie de sesión
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 3. Verificamos si el usuario existe (sesión activa)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. LÓGICA DE PROTECCIÓN 🔒
  // Definimos qué rutas queremos proteger
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isProyectosRoute = request.nextUrl.pathname.startsWith('/proyectos')
  
  // Si NO hay usuario y trata de entrar a admin o proyectos...
  if (!user && (isAdminRoute || isProyectosRoute)) {
     // ...¡PA FUERA! Lo mandamos al login (o al home '/')
     const url = request.nextUrl.clone()
     url.pathname = '/' // O pon '/login' si tienes una ruta específica
     return NextResponse.redirect(url)
  }

  // 5. BONUS: Si YA está logueado y trata de ir al login ('/'), lo mandamos a proyectos
  if (user && request.nextUrl.pathname === '/') {
     const url = request.nextUrl.clone()
     url.pathname = '/proyectos'
     return NextResponse.redirect(url)
  }

  return response
}

// Configuración: Aquí le decimos a Next.js en qué rutas debe activarse el guardia
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas EXCEPTO las que empiezan con:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del navegador)
     * - /api/ (si tienes rutas de API públicas)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}