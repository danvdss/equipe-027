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
