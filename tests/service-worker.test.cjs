const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('sw.js','utf8');
function fixture(){
 const handlers={},deleted=[];
 const self={location:{origin:'https://site.example'},addEventListener:(name,fn)=>handlers[name]=fn,
  skipWaiting(){},clients:{claim:async()=>{},matchAll:async()=>[]}};
 const caches={keys:async()=>['greenops-beta-shell-v10','greenops-beta-shell-v11','other-app-cache'],
  delete:async name=>deleted.push(name),match:async()=>undefined,open:async()=>({put:async()=>{},addAll:async()=>{}})};
 vm.runInNewContext(source,{self,caches,URL,fetch:async()=>({ok:true,clone(){return this}})});
 return {handlers,deleted};
}
test('activation retains unrelated origin caches',async()=>{
 const {handlers,deleted}=fixture();let promise;
 handlers.activate({waitUntil:p=>promise=p});await promise;
 assert.deepEqual(deleted,['greenops-beta-shell-v10']);
});
test('worker ignores API, third-party and write requests',()=>{
 const {handlers}=fixture();
 for(const request of [
  {method:'GET',url:'https://site.example/api/customer',mode:'cors'},
  {method:'GET',url:'https://provider.example/private',mode:'cors'},
  {method:'POST',url:'https://site.example/',mode:'cors'}]){
  let intercepted=false;handlers.fetch({request,respondWith:()=>intercepted=true});assert.equal(intercepted,false);
 }
});
