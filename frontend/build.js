import mustache from "mustache";
import * as esbuild from "esbuild";
import fs from "fs/promises";

async function build() {
  if (!process.env.BACKEND_URL) {
    console.log("Please specify the `BACKEND_URL` for the server.");
    process.exit(1);
  }
  await fs.writeFile(
    "src/config.ts",
    `export const BackendUrl = "${process.env.BACKEND_URL}";`,
  );

  const jsOutput = await esbuild.build({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    //minify: true,
    sourcemap: true,
    outfile: "dist/.bundle.js",
    platform: "browser",
  });

  const htmlTemplate = await fs.readFile("src/index.html", "utf-8");
  const js = await fs.readFile("dist/.bundle.js", "utf-8");

  await fs.writeFile("dist/index.html", mustache.render(htmlTemplate, { js }));
}

build();
