import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Bind the dev server so it doesn't crash if hostname headers vary
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  async redirects() {
    return [
      // Old PHP-based site URLs still indexed by search engines — send them
      // to their modern equivalents instead of 403/404ing.
      { source: "/employeelogin.php", destination: "/employers/login", permanent: true },
      { source: "/employeelogin", destination: "/login", permanent: true },
      { source: "/employerlogin.php", destination: "/employers/login", permanent: true },
      { source: "/employerlogin", destination: "/employers/login", permanent: true },
      { source: "/joblogin.php", destination: "/login", permanent: true },
      { source: "/jobseekerlogin.php", destination: "/login", permanent: true },
      { source: "/jobseekerlogin", destination: "/login", permanent: true },
      { source: "/login.php", destination: "/login", permanent: true },
      { source: "/register.php", destination: "/signup", permanent: true },
      { source: "/signup.php", destination: "/signup", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/aboutus.php", destination: "/", permanent: true },
      { source: "/aboutus", destination: "/", permanent: true },
      { source: "/about-us", destination: "/", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      // Catch-all: any other stray old .php URL still indexed by search
      // engines falls back to the homepage instead of 403/404ing.
      { source: "/:slug.php", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
