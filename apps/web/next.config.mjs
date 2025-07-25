/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@durchrechnen/ui"],
  experimental: {
    // Forward browser logs to the terminal for easier debugging
    browserDebugInfoInTerminal: true,
  },
  devIndicators: {
    position: 'bottom-right'
  },
}

export default nextConfig
