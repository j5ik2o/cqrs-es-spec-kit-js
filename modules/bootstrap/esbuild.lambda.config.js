const esbuild = require("esbuild");
const path = require("node:path");

const build = async () => {
  try {
    await esbuild.build({
      entryPoints: ["./src/lambda-rmu-handler.ts"],
      bundle: true,
      platform: "node",
      target: "node18",
      outfile: "./dist/lambda/index.js",
      external: [
        // Prisma Clientは個別にコピーするため除外
        "@prisma/client",
        ".prisma",
      ],
      format: "cjs",
      sourcemap: true,
      minify: false, // デバッグしやすくするため無効化
      logLevel: "info",
    });

    console.log("✅ Lambda function built successfully");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
};

build();
