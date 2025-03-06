import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-[100vh]">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ position: 'absolute' }}
        >
          <source src="/not-found.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center relative z-10">
        <h1 className="text-6xl font-bold gradient-title mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-200 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link href="/">
          <Button className="hover:scale-105 transition-transform">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}