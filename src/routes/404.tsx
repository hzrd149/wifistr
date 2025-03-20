import { A } from "@solidjs/router";

export default function NotFoundView() {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-4xl font-bold mb-4">404</h1>
      <p class="text-xl mb-8">Page not found</p>
      <A
        href="/"
        class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Return Home
      </A>
    </div>
  );
}
