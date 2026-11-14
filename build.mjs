// Build : src/jade/*.jade -> *.html, src/sass/*.scss -> assets/*.css + *.min.css
// Usage : node build.mjs [html|css] [--watch]
import { writeFileSync, watch } from "node:fs";
import pug from "pug";
import * as sass from "sass";

const pages = { "index.html": "src/jade/index.jade", "cv.html": "src/jade/cv.jade" };
const styles = { styles: "src/sass/styles.scss", styles_cv: "src/sass/styles_cv.scss" };

function html() {
  for (const [out, src] of Object.entries(pages)) {
    writeFileSync(out, pug.renderFile(src, { doctype: "html" }));
    console.log(`✔ ${src} -> ${out}`);
  }
}

function css() {
  for (const [name, src] of Object.entries(styles)) {
    writeFileSync(`assets/${name}.css`, sass.compile(src, { style: "expanded" }).css);
    writeFileSync(`assets/${name}.min.css`, sass.compile(src, { style: "compressed" }).css);
    console.log(`✔ ${src} -> assets/${name}.css, assets/${name}.min.css`);
  }
}

const safe = (fn) => () => {
  try { fn(); } catch (e) { console.error(`✖ ${e.message}`); }
};

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
const tasks = { html, css };
const selected = target ? { [target]: tasks[target] } : tasks;
if (target && !tasks[target]) {
  console.error(`Tâche inconnue : ${target} (html | css)`);
  process.exit(1);
}

for (const fn of Object.values(selected)) fn();

if (args.includes("--watch")) {
  if (selected.html) watch("src/jade", safe(html));
  if (selected.css) watch("src/sass", safe(css));
  console.log("👀 En attente de modifications…");
}
