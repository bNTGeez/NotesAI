/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/punycode/ },
    ];
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://notesai-nywa.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
