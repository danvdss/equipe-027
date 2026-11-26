// Read-only current-tree screening. Reports categories/counts, never matched values.
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process');
const git=process.env.E027_GIT||'git';
const files=cp.execFileSync(git,['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const patterns={privateKey:/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,githubToken:/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g,awsAccessId:/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,supabaseSecret:/\bsb_secret_[A-Za-z0-9_-]{20,}\b/g,serviceRoleJwt:/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g};
const findings=[];let scanned=0;
for(const name of files){if(!fs.existsSync(name)||!fs.statSync(name).isFile())continue;const b=fs.readFileSync(name);if(b.includes(0))continue;scanned++;const s=b.toString('utf8');for(const [category,re]of Object.entries(patterns)){let count=0;for(const m of s.matchAll(re)){if(category==='serviceRoleJwt'){try{const payload=JSON.parse(Buffer.from(m[0].split('.')[1],'base64url'));if(payload.role!=='service_role')continue;}catch{continue;}}count++;}if(count)findings.push({file:name,category,count});}}
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const vendor='supabase.min.js',origin='node_modules/@supabase/supabase-js/dist/umd/supabase.js';
console.log(JSON.stringify({scanned,findings,supabaseVendorByteIdentical:fs.existsSync(origin)?hash(vendor)===hash(origin):null,supabaseVendorNormalizedEqual:fs.existsSync(origin)?[vendor,origin].map(p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n').trim()).reduce((a,b)=>a===b):null,limitations:'Heuristic screening of tracked text in current tree only; not history, arbitrary secrets, remote configuration or exhaustive SCA.'},null,2));
if(findings.length)process.exitCode=2;
