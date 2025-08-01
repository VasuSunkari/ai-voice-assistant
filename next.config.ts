import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack(config: Configuration) {
    config.module?.rules?.push({
      test: /\.worker\.ts$/,
      use: { loader: 'worker-loader' },
    });
    return config;
  },
};

export default nextConfig;
