import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vitest/config";

/** Width and height from a PNG's IHDR chunk. */
function pngSize(file: string) {
  const bytes = readFileSync(file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

// A transparent 1×1 PNG, standing in for the blur placeholder Next generates.
const blurDataURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/**
 * Serves PNG imports the way Next's image loader does, as `StaticImageData`,
 * so components that import pictures render under Vitest.
 */
const nextStaticImages: Plugin = {
  name: "next-static-images",
  enforce: "pre",
  load(id) {
    if (!id.endsWith(".png")) return null;
    const data = { src: `/_next/static/media/${basename(id)}`, ...pngSize(id), blurDataURL };
    return `export default ${JSON.stringify(data)};`;
  },
};

export default defineConfig({
  plugins: [nextStaticImages],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
