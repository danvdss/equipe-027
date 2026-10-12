// package.json owns release identity; run npm run release after changing it.
const fs=require('node:fs'),version=require('./package.json').version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Use uma versão semântica numérica');
for(const f of ['index.html','receituario.html'])fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/\?v=[\d.]+/g,'?v='+version));
fs.writeFileSync('care.js',fs.readFileSync('care.js','utf8').replace(/const version = "[\d.]+"/,'const version = "'+version+'"'));
if(fs.existsSync('package-lock.json')){const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));lock.version=version;if(lock.packages?.[''])lock.packages[''].version=version;fs.writeFileSync('package-lock.json',JSON.stringify(lock,null,2)+'\n');}
