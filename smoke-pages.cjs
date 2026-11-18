const fs=require("node:fs");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const base="https://danvdss.github.io/equipe-027/";
const html=fs.readFileSync("index.html","utf8");
const assets=[...new Set([...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))(?:\?v=[^"]+)?"/g)].map(m=>m[1]).filter(s=>!s.startsWith("http")))];
const sha=s=>crypto.createHash("sha256").update(s.toString("utf8").replace(/\r\n/g,"\n")).digest("hex");
async function check(){
 const results=[];
 for(const path of ["index.html",...assets]){
  const response=await fetch(base+path,{signal:AbortSignal.timeout(20000),headers:{"cache-control":"no-cache"}});
  assert.equal(response.status,200,"Arquivo nao publicado: "+path);
  const body=Buffer.from(await response.arrayBuffer());
  const local=fs.readFileSync(path);
  assert.equal(sha(body),sha(local),"Arquivo publicado difere da branch local: "+path);
  results.push(path);
 }
 console.log("Site publicado verificado: "+results.length+" arquivos com HTTP 200 e SHA-256 igual ao local.");
}
check().catch(e=>{console.error(e);process.exitCode=1});
