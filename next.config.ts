import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Nécessaire pour que la route d'import ponctuel du catalogue (qui lit les
  // fichiers de catalogue-import/ via fs) embarque bien ces fichiers dans la
  // fonction serverless Vercel. À retirer avec catalogue-import/ après l'import.
  outputFileTracingIncludes: {
    "/api/admin/import-catalogue": ["./catalogue-import/**/*"],
  },
};

export default nextConfig;
