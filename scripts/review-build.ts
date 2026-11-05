import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { readEntries, projectRoot, type ContentRecord } from './validate-content.ts';
import {fileURLToPath} from 'node:url';
import {searchRecord,type SearchRecord} from '../src/lib/search.ts';
import { categoryIds } from '../src/data/categories.ts';
export function reviewBuild(entries:ContentRecord[]){
const dist=path.join(projectRoot,'dist');
const published=entries.filter(e=>e.data.status==='published');
function routeFor(e:typeof entries[number]){return `/${e.data.type==='photo_album'?'photos':e.data.type==='video'?'videos':'entry'}/${e.id}/`;}
function targetFor(url:string){const local=path.join(dist,decodeURIComponent(new URL(url,'http://local.invalid').pathname));return url.split(/[?#]/)[0].endsWith('/')?path.join(local,'index.html'):local;}
for(const id of categoryIds)assert(existsSync(targetFor(`/library/${id}/`)),`缺少分类 ${id}`);
for(const entry of entries){
 if(['article','video','photo_album'].includes(entry.data.type))assert.equal(existsSync(targetFor(routeFor(entry))),entry.data.status==='published',`资料详情页状态不匹配：${entry.id}`);
}
const searchIndex=JSON.parse(readFileSync(path.join(dist,'search-index.json'),'utf8')) as SearchRecord[];
assert.deepEqual([...searchIndex].sort((a,b)=>a.id.localeCompare(b.id)),published.map(searchRecord).sort((a,b)=>a.id.localeCompare(b.id)),'搜索索引必须包含全部公开条目且字段一致');
for(const record of searchIndex){
 const html=readFileSync(targetFor(record.href),'utf8');
 assert(html.includes(`id="resource-${record.id}"`),`搜索目标缺少定位锚点：${record.id}`);
}
let pageCount=0,linkCount=0;
function inspect(directory:string){for(const file of readdirSync(directory,{withFileTypes:true})){
 const full=path.join(directory,file.name);
 if(file.isDirectory())inspect(full);else if(file.name.endsWith('.html')){
  pageCount++;const html=readFileSync(full,'utf8');
  for(const match of html.matchAll(/\b(?:href|src)="([^"<>]+)"/g)){
   const url=match[1];if(!url.startsWith('/')||url.startsWith('//'))continue;
   assert(existsSync(targetFor(url)),`失效站内链接 ${path.relative(dist,full)} → ${url}`);linkCount++;
  }
 }
}}
inspect(dist);
const report={pages:pageCount,checkedLocalLinks:linkCount,published:published.map(e=>({id:e.id,category:e.data.category_id,type:e.data.type})),drafts:entries.filter(e=>e.data.status==='draft').map(e=>e.id),checks:['schema','local assets exist','seven category pages','detail pages match status','built internal links resolve']};
mkdirSync(path.join(projectRoot,'.local-reports'),{recursive:true});
writeFileSync(path.join(projectRoot,'.local-reports/build-review.json'),JSON.stringify(report,null,2)+'\n');
console.log(`静态产物审查通过：${pageCount} 页，${linkCount} 个站内引用；报告 .local-reports/build-review.json。`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 reviewBuild(readEntries());
}
