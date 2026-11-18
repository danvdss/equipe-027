const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const files=fs.readdirSync('.').filter(f=>/\.(?:js|cjs)$/.test(f)&&!f.endsWith('.min.js'));
for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const version=require('./package.json').version;
for(const f of ['index.html','receituario.html']){const versions=[...fs.readFileSync(f,'utf8').matchAll(/\?v=([\d.]+)/g)].map(m=>m[1]);if(versions.some(v=>v!==version))throw Error('Cache divergente: '+f);}
if(!fs.readFileSync('care.js','utf8').includes('const version = "'+version+'"'))throw Error('Versão de Care divergente');
console.log(files.length+' arquivos próprios verificados; release '+version);

// Fail release if the Pages artifact omits an asset referenced by index.html.
const html=fs.readFileSync("index.html","utf8");
const assets=[...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))(?:\?v=[^"]+)?"/g)].map(x=>x[1]).filter(x=>!x.startsWith("http"));
const workflow=fs.readFileSync(".github/workflows/quality.yml","utf8");
const publish=workflow.split("cp ")[1]?.split(" public/")[0]?.replace(/\\\n\s*/g," ")||"";
for(const asset of assets){if(!fs.existsSync(asset))throw Error("Asset inexistente: "+asset);if(!publish.split(/\s+/).includes(asset))throw Error("Asset ausente do Pages: "+asset)}
