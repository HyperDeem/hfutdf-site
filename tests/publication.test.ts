import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {assertPublicFiles,assertProductionEntries} from '../scripts/publication-policy.ts';
import {entrySchema} from '../src/content/schema.ts';
const root=()=>mkdtempSync(path.join(tmpdir(),'hfutdf-publication-test-'));
test('public 的未批准文件会在复制前阻断，不依赖扩展名',()=>{
 for(const name of ['unapproved.pdf','unapproved.jpg','unapproved.docx','innocent.txt']){
  const dir=root();writeFileSync(path.join(dir,name),'SYNTHETIC_TEST_ONLY');assert.throws(()=>assertPublicFiles(dir));
 }
});
test('录像与压缩包即使列入清单也保持关闭',()=>{
 for(const name of ['sample.mp4','sample.ZIP','sample.rar']){
  const dir=root();writeFileSync(path.join(dir,name),'SYNTHETIC_TEST_ONLY');assert.throws(()=>assertPublicFiles(dir,[name]));
 }
});
test('静态本地区域和缺失批准项被拒绝，明确批准的安全文本可通过',()=>{
 const dir=root();writeFileSync(path.join(dir,'safe.txt'),'SYNTHETIC_TEST_ONLY');assertPublicFiles(dir,['safe.txt']);
 assert.throws(()=>assertPublicFiles(dir,['safe.txt','missing.txt']));mkdirSync(path.join(dir,'local'));assert.throws(()=>assertPublicFiles(dir,['safe.txt']));
});
test('生产条目必须独立批准，测试示例和比赛地址不能发布',()=>{
 const record=(extra:object)=>({id:'fictional',data:entrySchema.parse({title:'虚构测试',category_id:'books',type:'article',demo:false,...extra}),body:'测试'});
 assert.throws(()=>assertProductionEntries([record({})]));
 assert.throws(()=>assertProductionEntries([record({demo:true})],['fictional']));
 assert.throws(()=>assertProductionEntries([record({category_id:'videos',type:'video',url:'/files/sample.zip'})],['fictional']));
 assertProductionEntries([record({})],['fictional']);assertProductionEntries([]);
});

test('不能把内容藏在静态占位文件中',()=>{
 const dir=root();writeFileSync(path.join(dir,'.gitkeep'),'SYNTHETIC_TEST_ONLY');assert.throws(()=>assertPublicFiles(dir));
});
