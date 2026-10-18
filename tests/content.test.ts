import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import { entrySchema } from '../src/content/schema.ts';
import { readEntries, readEntriesFrom } from '../scripts/validate-content.ts';
const base={title:'模拟资料',category_id:'books',type:'article'};
test('草稿和模拟标记默认值；未知作者与日期可留空',()=>{
 const parsed=entrySchema.parse({...base,source_credit:null,published_at:null});assert.equal(parsed.status,'draft');assert.equal(parsed.demo,true);
});
test('拒绝无效分类、类型配对和未知字段；支持明确标记的本地真实资料',()=>{
 for(const data of [{...base,category_id:'invalid'},{...base,category_id:'photos'},{...base,rights_status:'x'},{...base,title:'  '}])assert.equal(entrySchema.safeParse(data).success,false);
 assert(entrySchema.safeParse({...base,demo:false}).success);
});
test('不自动补赛事；单张相册有效、空相册无效',()=>{
 const video=entrySchema.parse({title:'录像',category_id:'videos',type:'video'});assert.equal('event' in video&&video.event,null);
 const album={title:'相册',category_id:'photos',type:'photo_album',images:[{src:'/images/demo-1.svg',alt:'模拟图像'}]};assert(entrySchema.safeParse(album).success);assert(!entrySchema.safeParse({...album,images:[]}).success);
});
test('拒绝脚本地址、外部媒体与路径跳转',()=>{
 for(const url of ['javascript:alert(1)','https://example.com/a.pdf','//example.com/a','/../secret','/files/../secret','/files/a.txt?x=1'])assert(!entrySchema.safeParse({title:'文件',category_id:'academic',type:'file',url}).success);
 assert(!entrySchema.safeParse({title:'链接',category_id:'books',type:'link',url:'javascript:alert(1)'}).success);
 assert(!entrySchema.safeParse({title:'链接',category_id:'books',type:'link',url:'invalid url'}).success);
});
test('日期必须有效，不能默默更正无效日期',()=>{
 assert(entrySchema.safeParse({...base,published_at:'2024-02-29'}).success);assert(!entrySchema.safeParse({...base,published_at:'2025-02-29'}).success);
});
test('当前内容目录可校验，不限制条目数量或要求分类必须有内容',()=>{
 const entries=readEntries();assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
 for(const entry of entries)assert(entrySchema.safeParse(entry.data).success,entry.id);
});

test('虚构示例仅从测试目录读取，生产目录为空',()=>{
 const fixtureRoot=new URL('./fixtures/',import.meta.url);
 const samples=readEntriesFrom(fileURLToPath(new URL('entries/',fixtureRoot)),fileURLToPath(new URL('public/',fixtureRoot)));
 assert.equal(samples.length,2);assert(samples.every(e=>e.data.demo));assert.equal(readEntries().length,0);
});
