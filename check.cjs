const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const files=fs.readdirSync('.').filter(f=>/\.(?:js|cjs)$/.test(f)&&!f.endsWith('.min.js'));
for(const file of files)execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const version=require('./package.json').version;
for(const f of ['index.html','receituario.html']){const versions=[...fs.readFileSync(f,'utf8').matchAll(/\?v=([\d.]+)/g)].map(m=>m[1]);if(versions.some(v=>v!==version))throw Error('Cache divergente: '+f);}
if(!fs.readFileSync('care.js','utf8').includes('const version = "'+version+'"'))throw Error('Versão de Care divergente');
console.log(files.length+' arquivos próprios verificados; release '+version);
