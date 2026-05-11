import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      include: ["src/lib/**"],
      exclude: ["src/lib/api-clients.ts", "src/lib/constants.ts"],
    },
  },
});
