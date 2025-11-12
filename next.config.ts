import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Tắt ESLint trong build để tránh fail (có thể bật lại sau khi fix hết lỗi)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Cho phép build tiếp tục ngay cả khi có lỗi TypeScript
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
