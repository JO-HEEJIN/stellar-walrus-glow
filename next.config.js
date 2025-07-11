module.exports = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        permanent: true,
      },
    ]
  }
}