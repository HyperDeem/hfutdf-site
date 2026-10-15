import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { readEntries, projectRoot } from './validate-content.ts';
import { categoryIds } from '../src/data/categories.ts';
const dist=path.join(projectRoot,'dist');
const entries=readEntries();
const published=entries.filter(e=>e.data.status==='published');
function routeFor(e:typeof entries[number]){return `/${e.data.type==='photo_album'?'photos':e.data.type==='video'?'videos':'entry'}/${e.id}/`;}
function targetFor(url:string){const local=path.join(dist,decodeURIComponent(new URL(url,'http://local.invalid').pathname));return url.split(/[?#]/)[0].endsWith('/')?path.join(local,'index.html'):local;}
for(const id of categoryIds)assert(existsSync(targetFor(`/library/${id}/`)),`缺少分类 ${id}`);
for(const entry of entries){
 if(['article','video','photo_album'].includes(entry.data.type))assert.equal(existsSync(targetFor(routeFor(entry))),entry.data.status==='published',`草稿/展示状态与页面不匹配：${entry.id}`);
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
const report={pages:pageCount,checkedLocalLinks:linkCount,published:published.map(e=>({id:e.id,category:e.data.category_id,type:e.data.type})),drafts:entries.filter(e=>e.data.status==='draft').map(e=>e.id),checks:['schema','local assets exist','seven category pages','draft detail pages absent','published detail pages exist','built internal links resolve']};
writeFileSync(path.join(projectRoot,'docs/build-review.json'),JSON.stringify(report,null,2)+'\n');
console.log(`静态产物审查通过：${pageCount} 页，${linkCount} 个站内引用；报告 docs/build-review.json。`);
