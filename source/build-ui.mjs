import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as esbuild from "esbuild";

const dir = dirname(fileURLToPath(import.meta.url));

async function bundlePanel(uiEntry) {
  const result = await esbuild.build({
    entryPoints: [join(dir, uiEntry)],
    bundle: true,
    format: "iife",
    platform: "browser",
    minify: true,
    write: false,
  });
  return result.outputFiles[0].text;
}

const recordingTemplate = readFileSync(join(dir, "recordingHtml.template.html"), "utf8");
const recordingBundle = await bundlePanel("recordingHtml.ui.js");
// A function replacer avoids the classic String.replace() footgun: a plain
// replacement string with "$&"/"$1"-style sequences (present in the bundled
// code, e.g. zod's escapeRegex) is otherwise interpreted as a substitution
// pattern instead of literal text.
const recordingHtml = recordingTemplate.replace("__BUNDLED_UI__", () => `<script>${recordingBundle}</script>`);

const out = `// Generated file: recordingHtml inlines recordingHtml.template.html +
// an esbuild IIFE bundle of recordingHtml.ui.js (which resolves the
// @modelcontextprotocol/ext-apps import).
// Regenerate with \`node source/build-ui.mjs\` whenever those files change.
export const recordingHtml = ${JSON.stringify(recordingHtml)};
`;

writeFileSync(join(dir, "generated-ui.mjs"), out);
console.log(`wrote generated-ui.mjs (${out.length} bytes)`);
