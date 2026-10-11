const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
   const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8080/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#root')?.textContent.trim().length>40);
   assert.equal(await page.title(),'GreenOps Beta');
   assert.equal(errors.length,0,errors.join('\n'));
   await page.evaluate(async()=>{
    await navigator.serviceWorker.ready;
    await caches.open('unrelated-browser-test');
   });
   await page.reload({waitUntil:'domcontentloaded'});
   assert(await page.evaluate(()=>caches.has('unrelated-browser-test')));
   await context.setOffline(true);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#root')?.textContent.trim().length>40);
   assert.equal(errors.length,0,errors.join('\n'));
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
