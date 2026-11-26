import type { NextConfig } from "next";

// cacheComponents는 켜지 않는다. 켜면 이전 경로의 화면 상태가 유지되어
// 새 사진을 찍어도 지난 품목과 답변이 그대로 보인다(docs/TEST_LOG.md 참고).
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
