import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false, devIndicators: false,
  async redirects() { return process.env.VERCEL ? [{ source: '/', destination: '/stage', permanent: false }] : []; },
};
export default config;
