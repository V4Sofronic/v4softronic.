import { NextConfig } from 'next';

const config: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Optional: you can set a custom host/port here if needed.
  // devIndicators: { autoPrerender: false },
};

export default config;
