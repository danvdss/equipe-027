const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const vm=require('node:vm');
const tick=()=>new Promise(r=>setTimeout(r,0));
async function setup(t,overrides={},hash='') {
 const d=new JSDOM('<div id="app"></div>',{url:'https://example.test/'+hash,runScripts:'outside-only'});
 const w=d.window;const calls=[];let callback;
 const auth={
  onAuthStateChange(fn){callback=fn;},getSession:async()=>({data:{session:null},error:null}),
  signInWithPassword:async data=>{calls.push(['signin',data]);return {error:null};},
  getUser:async()=>({data:{user:{id:'test-user',email_confirmed_at:'2026-01-01'}},error:null}),
  resetPasswordForEmail:async()=>({error:null}),updateUser:async()=>({error:null}),
  signOut:async()=>({error:null}),stopAutoRefresh(){},...overrides
 };
 w.supabase={createClient:(url,key,options)=>{calls.push(['options',options]);return {auth};}};
 vm.runInContext('let logged=false,drafts={},history=[],extraCount=0,page="home";const app=document.querySelector("#app");const Flow={reset(){}};function destroyReceituario(){};function render(){app.textContent="Workspace";}',d.getInternalVMContext());
 vm.runInContext(fs.readFileSync('auth.js','utf8'),d.getInternalVMContext());
 const run=s=>vm.runInContext(s,d.getInternalVMContext());
 await run('Access.start()');t.after(()=>w.close());
 const fill=(name,val)=>w.document.querySelector(`[name="${name}"]`).value=val;
 const submit=async()=>{w.document.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await tick();};
 return {w,run,fill,submit,calls,auth,event:name=>callback(name)};
}
test('auth uses ephemeral sessions and rejects invalid credentials without opening workspace',async t=>{
 const s=await setup(t,{signInWithPassword:async()=>({error:{status:400}})});
 assert.equal(s.calls[0][1].auth.persistSession,false);
 s.fill('email','test@example.test');s.fill('password','synthetic-password');await s.submit();
 assert.equal(s.run('logged'),false);assert.match(s.w.document.querySelector('#error').textContent,/Não foi possível entrar/);
 assert.equal(s.w.document.querySelector('[name=password]').value,'');
 assert.equal(s.w.localStorage.length,0);
});
test('login requires server user validation and confirmed email',async t=>{
 const s=await setup(t,{getUser:async()=>({data:{user:null},error:{status:401}})});
 s.fill('email','test@example.test');s.fill('password','synthetic-password');await s.submit();
 assert.equal(s.run('logged'),false);
 s.auth.getUser=async()=>({data:{user:{id:'user'}},error:null});await s.submit();assert.equal(s.run('logged'),false);
 s.auth.getUser=async()=>({data:{user:{id:'user',email_confirmed_at:'2026-01-01'}},error:null});await s.submit();
 assert.equal(s.run('logged'),true);
 s.run('drafts={general:{name:"synthetic"}};history=["synthetic"]');s.event('SIGNED_OUT');
 assert.equal(s.run('logged'),false);assert.equal(s.run('Object.keys(drafts).length'),0);assert.equal(s.run('history.length'),0);
});
test('recovery preserves account privacy and handles service errors',async t=>{
 const s=await setup(t);s.w.document.querySelector('#access-secondary').click();s.fill('email','test@example.test');await s.submit();
 assert.match(s.w.document.querySelector('#error').textContent,/Se houver uma conta/);
 s.auth.resetPasswordForEmail=async()=>({error:{status:429}});await s.submit();assert.match(s.w.document.querySelector('#error').textContent,/Muitas tentativas/);
});
test('invite requires valid session; passwords must match and saving signs out',async t=>{
 let updates=0,outs=0;
 const s=await setup(t,{getSession:async()=>({data:{session:{user:{id:'user'}}},error:null}),updateUser:async()=>{updates++;return {error:null};},signOut:async()=>{outs++;return {error:null};}},'#type=invite&access_token=synthetic');
 assert.equal(s.w.location.hash,'');s.fill('password','synthetic-password');s.fill('confirmation','different');await s.submit();assert.equal(updates,0);
 s.fill('confirmation','synthetic-password');await s.submit();assert.equal(updates,1);assert.equal(outs,1);assert.equal(s.run('logged'),false);assert.match(s.w.document.querySelector('#error').textContent,/Senha salva/);
});
test('expired callback never opens password form or workspace',async t=>{
 const s=await setup(t,{},'#error=access_denied&error_code=otp_expired');assert.equal(s.w.location.hash,'');assert.equal(s.w.document.querySelector('[name=confirmation]'),null);assert.equal(s.run('logged'),false);assert.match(s.w.document.querySelector('#error').textContent,/novo link/);
});
test('logout erases clinical drafts even when remote revocation fails',async t=>{
 const s=await setup(t,{signOut:async()=>({error:{status:500}})});s.run('logged=true;drafts={general:{value:"synthetic"}};history=["synthetic"]');await s.run('Access.signOut()');assert.equal(s.run('logged'),false);assert.equal(s.run('history.length'),0);assert.equal(s.run('Object.keys(drafts).length'),0);assert.match(s.w.document.querySelector('#error').textContent,/feche esta aba/);
});
