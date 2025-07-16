/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // External packages that should not be bundled by webpack
  serverExternalPackages: [
    "mongoose",
    "firebase-admin",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
    "google-auth-library",
    "google-gax",
    "google-proto-files",
    "protobufjs",
  ],
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Exclude problematic packages from being bundled
      config.externals = config.externals || [];
      config.externals.push(
        "@grpc/grpc-js",
        "@grpc/proto-loader",
        "firebase-admin",
        "google-auth-library",
        "google-gax",
        "google-proto-files",
        "protobufjs"
      );
    }

    // Handle node modules that might cause issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };

    return config;
  },
};

export default nextConfig;
