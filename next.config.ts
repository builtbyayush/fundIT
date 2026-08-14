import type { NextConfig } from "next";

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...(cloudinaryCloudName
        ? [
            {
              protocol: "https" as const,
              hostname: "res.cloudinary.com",
              pathname: `/${cloudinaryCloudName}/**`,
            },
          ]
        : [
            {
              protocol: "https" as const,
              hostname: "res.cloudinary.com",
              pathname: "/**",
            },
          ]),
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
