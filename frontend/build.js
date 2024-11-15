import mustache from "mustache";
import * as esbuild from "esbuild";
import fs from "fs/promises";

async function build() {
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
