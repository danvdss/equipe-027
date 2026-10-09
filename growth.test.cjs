const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
function setup(t){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.navigator.clipboard={writeText:async s=>{w.copied=s}};
 const run=s=>vm.runInContext(s,dom.getInternalVMContext());
 for(const f of ['care.js','workflow.js','notes.js','prenatal.js','implante.js','diu.js','lab-details.js','shortcuts.js','renewal.js','growth-data.js','growth.js','app.js'])run(fs.readFileSync(f,'utf8'));
 run('logged=true;page="child";render()');t.after(()=>w.close());
 const set=(name,value)=>{const el=w.document.querySelector(`[name="${name}"]`);assert.ok(el,name);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));return el};
 return {w,run,set};
}
const sample={pcBirth:'2026-01-09',recordDate:'2026-10-09',pcSex:'Feminino',pcWeight:'8,2',pcLength:'70',pcHead:'43',pcMeasure:'Comprimento deitado'};
test('reference tables are complete, ordered and match the numeric source manifest',t=>{
 const {run}=setup(t);const tables=JSON.parse(run('JSON.stringify(GrowthReference)'));
 const crypto=require('node:crypto');
 const sources=JSON.parse(fs.readFileSync('growth-sources.json','utf8'));
 for(const src of sources){const rows=tables[src.table];assert.equal(rows.length,src.months[1]-src.months[0]+1);assert.match(src.url,/^https:\/\/cdn.who.int\//);
 rows.forEach((r,i)=>{assert.equal(r[0],src.months[0]+i);assert.equal(r.length,8);r.slice(2).forEach((v,j)=>assert.ok(v>r[j+1]))});
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'),src.sha256_extracted_rows);
 }
 assert.deepEqual(tables.weight_f[0],[0,2,2.4,2.8,3.2,3.7,4.2,4.8]);
 assert.equal(tables.length_m[24][4],87.8);assert.equal(tables.height_m[0][4],87.1);
 assert.equal(tables.head_f[24][4],47.2);assert.equal(tables.bmi5_f.at(-1)[4],16.6);
});
test('blank/invalid dates and unknown sex never create a patient point',t=>{
 const {run}=setup(t);
 for(const d of [{},{...sample,pcSex:''},{...sample,pcSex:'Outro / não especificado'},{...sample,pcBirth:'2026-02-30'},{...sample,pcBirth:'2027-01-01'},{...sample,recordDate:''}]){
 assert.ok(run(`GrowthCharts.model(${JSON.stringify(d)}).reason`));assert.doesNotMatch(run(`GrowthCharts.svg(GrowthCharts.model(${JSON.stringify(d)}),'weight')`),/class="growth-point"/);
 }
});
test('live metrics, sex-specific curves, BMI and missing measurements',t=>{
 const {run}=setup(t);const m=run(`GrowthCharts.model(${JSON.stringify(sample)})`);
 assert.equal(m.values.bmi,8.2/.7**2);assert.equal(m.sex,'f');assert.equal(m.days,273);
 assert.match(run(`GrowthCharts.svg(GrowthCharts.model(${JSON.stringify(sample)}),'bmi')`),/class="growth-point"/);
 const male={...sample,pcSex:'Masculino'};
 assert.notEqual(run(`GrowthCharts.rows(GrowthCharts.model(${JSON.stringify(sample)}),'weight')[0][4]`),run(`GrowthCharts.rows(GrowthCharts.model(${JSON.stringify(male)}),'weight')[0][4]`));
 for(const v of ['',0,-2,'abc'])assert.equal(run(`GrowthCharts.model(${JSON.stringify({...sample,pcWeight:v})}).values.bmi`),null);
});
test('measurement posture, prematurity and age limits prevent misleading points',t=>{
 const {run}=setup(t);
 for(const d of [{...sample,pcMeasure:''},{...sample,pcMeasure:'Estatura em pé'},{...sample,pcGestWeeks:'34'}])assert.doesNotMatch(run(`GrowthCharts.svg(GrowthCharts.model(${JSON.stringify(d)}),'bmi')`),/class="growth-point"/);
 const child={...sample,pcBirth:'2020-01-09',pcMeasure:'Estatura em pé'};
 assert.match(run(`GrowthCharts.pointIssue(GrowthCharts.model(${JSON.stringify(child)}),'head')`),/0 a 24 meses/);
 assert.equal(run(`GrowthCharts.rows(GrowthCharts.model(${JSON.stringify(child)}),'weight').length`),61);
 assert.ok(run(`GrowthCharts.model(${JSON.stringify({...child,pcBirth:'2010-01-09'})}).reason`));
 assert.equal(run(`GrowthCharts.rows(GrowthCharts.model({pcSex:'Masculino',pcBirth:'2024-01-01',recordDate:'2025-12-31'}),'length')[0][0]`),0);
 assert.equal(run(`GrowthCharts.rows(GrowthCharts.model({pcSex:'Masculino',pcBirth:'2024-01-01',recordDate:'2026-01-01'}),'length')[0][0]`),24);
});
test('point outside chart scale is marked rather than silently clipped',t=>{
 const {run}=setup(t);const svg=run(`GrowthCharts.svg(GrowthCharts.model(${JSON.stringify({...sample,pcWeight:'500'})}),'weight')`);
 assert.match(svg,/Fora da escala exibida/);assert.match(svg,/path class="growth-point"/);assert.doesNotMatch(svg,/NaN|Infinity/);
});
test('widget updates without focus changes, expands all four charts and preserves form/narrative',async t=>{
 const {run,w,set}=setup(t);const doc=w.document;
 assert.ok(doc.querySelector('#growth-dock').classList.contains('growth-collapsed'));
 assert.equal(doc.querySelector('[data-minimize]').getAttribute('aria-expanded'),'false');
 doc.querySelector('[data-minimize]').click();
 assert.ok(!doc.querySelector('#growth-dock').classList.contains('growth-collapsed'));
 assert.equal(doc.querySelector('[data-minimize]').getAttribute('aria-expanded'),'true');
 for(const [k,v] of Object.entries({...sample,pcWeight:'8.2'}))set(k,v);
 const weight=set('pcWeight','8.4');weight.focus();weight.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(doc.activeElement,weight);assert.match(doc.querySelector('[data-mini]').textContent,/8,4/);
 assert.equal(doc.querySelector('[name="pcGraph"]').value,'');
 const before=run('JSON.stringify(Object.fromEntries(new FormData(document.querySelector("#clinical"))))');
 doc.querySelector('#growth-kind').value='bmi';doc.querySelector('#growth-kind').dispatchEvent(new w.Event('change'));
 doc.querySelector('[data-expand]').click();assert.equal(doc.querySelectorAll('.growth-dialog .growth-card').length,4);
 set('pcWeight','9');assert.match(doc.querySelector('.growth-dialog .growth-card').textContent,/9 kg/);
 doc.querySelector('.growth-dialog [data-close]').click();assert.equal(doc.activeElement,doc.querySelector('[data-expand]'));
 doc.querySelector('[data-minimize]').click();assert.ok(doc.querySelector('#growth-dock').classList.contains('growth-collapsed'));
 assert.equal(doc.querySelector('[name="pcWeight"]').value,'9');
 await new Promise(r=>setTimeout(r,220));const text=doc.querySelector('#output').value;
 assert.doesNotMatch(text,/OMS|Registro nos gráficos|Eutrofia|normalidade/);
 await run('Flow.copyCurrent()');assert.equal(w.copied,doc.querySelector('#output').value);
 const after=JSON.parse(run('JSON.stringify(Object.fromEntries(new FormData(document.querySelector("#clinical"))))'));
 const original=JSON.parse(before);original.pcWeight='9';assert.deepEqual(after,original);
});
test('widget lifecycle follows module drafts, reset and logout without persistent patient storage',async t=>{
 const {w,run,set}=setup(t);set('pcWeight','8.4');
 run('navigate("general")');assert.equal(w.document.querySelector('#growth-dock'),null);
 run('navigate("child")');assert.equal(w.document.querySelector('[name="pcWeight"]').value,'8.4');assert.equal(w.document.querySelectorAll('#growth-dock').length,1);
 run('drafts={};page="child";render()');assert.equal(w.document.querySelector('[name="pcWeight"]').value,'');assert.doesNotMatch(w.document.querySelector('[data-mini]').textContent,/8,4/);
 run('logged=false;login()');assert.equal(w.document.querySelector('#growth-dock'),null);
 assert.equal(w.localStorage.getItem('growth'),null);
});
