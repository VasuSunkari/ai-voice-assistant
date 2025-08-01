/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.worker\.ts$/,
      use: { loader: "worker-loader" },
    });
    return config;
  },
};

module.exports = nextConfig;
