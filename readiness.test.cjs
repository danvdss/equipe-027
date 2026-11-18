const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const read=f=>fs.readFileSync(require("node:path").join(__dirname,f),"utf8");
test("public entrypoint uses server-verified access, not shared local credentials",()=>{
 const html=read("index.html"),auth=read("auth.js");
 assert.match(html,/src="auth\.js\?v=/);
 assert.match(html,/src="supabase\.min\.js\?v=/);
 assert.match(auth,/functions\/v1\/username-login/);
 assert.match(auth,/client\.auth\.getUser\(\)/);
 assert.match(auth,/persistSession:\s*false/);
 assert.doesNotMatch(html,/localStorage|sessionStorage/);
});
test("interface supports keyboard focus, reduced motion and mobile layouts",()=>{
 const css=read("style.css");
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.match(css,/@media\s*\(max-width:\s*600px\)/);
 assert.match(read("app.js"),/skip-link/);
 assert.match(read("index.html"),/name="viewport"/);
});
test("clinical drafts are not sent to remote storage by enhancement module",()=>{
 const src=read("enhancements.js");
 assert.doesNotMatch(src,/localStorage|sessionStorage|indexedDB|fetch\s*\(/);
 assert.match(src,/equipe027:new-encounter/);
});

test("shared screen palette meets text and control contrast targets", () => {
  const tokens = Object.fromEntries([...read("theme.css").matchAll(/--ui-([\w-]+):\s*#([0-9a-f]{6});/g)]
    .map(([, name, hex]) => [name, hex]));
  function luminance(name) {
    assert.ok(tokens[name], name);
    const channels = tokens[name].match(/../g).map(pair => parseInt(pair, 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  function check(foreground, background, minimum) {
    const pair = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
    const ratio = (pair[1] + 0.05) / (pair[0] + 0.05);
    assert.ok(ratio >= minimum, foreground + " on " + background + ": " + ratio.toFixed(2));
  }
  for (const surface of ["page", "card", "surface", "field", "hover"]) {
    check("text", surface, 4.5);
    check("muted", surface, 4.5);
    check("control", surface, 3);
    check("focus", surface, 3);
  }
  check("brand", "action", 4.5);
  check("brand", "action-hover", 4.5);
  check("warning", "warning-bg", 4.5);
  check("error", "error-bg", 4.5);
  check("chart-low-high", "card", 3);
  check("chart-normal", "card", 3);
  for (const sheet of ["design.css", "rx-workflow.css"]) {
    assert.match(read(sheet), /^@import url\("theme\.css"\) screen;/);
  }
  assert.match(read(".github/workflows/quality.yml"), /cp .*\btheme\.css\b/);
});
