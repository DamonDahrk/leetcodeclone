import { clerkMiddleware,createRouteMatcher  } from '@clerk/nextjs/server';
// remember to import routematcher and stuff 


const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)','/'])
// .* uses regex to match all
// routes that do not require authentication

export default clerkMiddleware(
    async(auth, req) => {
       if (!isPublicRoute(req)){  //forgot to put req
            await auth.protect()
            // will redirect to sign-in if not authenticated
        }
    }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};