import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/cart";
import { AuthProvider } from "@/contexts/auth";
import faviconUrl from "@/assets/favicon.svg?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-foreground/70 mb-8">
          This page doesn't exist.
        </p>
        <Link
          to="/"
          className="btn-primary inline-block"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-foreground/70 mb-8">
          We encountered an error. Please try again.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="btn-secondary"
          >
            Home
          </Link>
        </div>
        {import.meta.env.DEV ? (
          <pre className="mt-6 max-w-xl overflow-auto whitespace-pre-wrap rounded-md bg-background/30 p-4 text-xs text-foreground/60">
            {error.stack}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zyro" },
      { name: "description", content: "Premium phone cases engineered for durability." },
    ],
    links: [
      {
        rel: "icon",
        href: faviconUrl,
        type: "image/svg+xml",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Toaster position="top-right" richColors closeButton theme="dark" />
          <main className="min-h-screen pt-16">
            <Outlet />
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
