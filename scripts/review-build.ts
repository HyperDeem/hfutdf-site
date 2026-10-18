import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { readEntries, projectRoot } from './validate-content.ts';
import { categoryIds } from '../src/data/categories.ts';
import {videoPublicationEnabled} from '../src/lib/publication.ts';
const dist=path.join(projectRoot,'dist');
const entries=readEntries();
const published=entries.filter(e=>e.data.status==='published');
function routeFor(e:typeof entries[number]){return `/${e.data.type==='photo_album'?'photos':e.data.type==='video'?'videos':'entry'}/${e.id}/`;}
function targetFor(url:string){const local=path.join(dist,decodeURIComponent(new URL(url,'http://local.invalid').pathname));return url.split(/[?#]/)[0].endsWith('/')?path.join(local,'index.html'):local;}
for(const id of categoryIds)assert(existsSync(targetFor(`/library/${id}/`)),`缺少分类 ${id}`);
for(const entry of entries){
 if(['article','video','photo_album'].includes(entry.data.type))assert.equal(existsSync(targetFor(routeFor(entry))),entry.data.status==='published'&&(entry.data.type!=='video'||videoPublicationEnabled),`草稿/展示或公开策略与页面不匹配：${entry.id}`);
 if(!videoPublicationEnabled&&entry.data.type==='video'&&entry.data.url)assert(!existsSync(targetFor(entry.data.url)),`暂停公开的视频文件不应进入产物：${entry.id}`);
}
let pageCount=0,linkCount=0;
function inspect(directory:string){for(const file of readdirSync(directory,{withFileTypes:true})){
 const full=path.join(directory,file.name);
 if(file.isDirectory())inspect(full);else if(file.name.endsWith('.html')){
  pageCount++;const html=readFileSync(full,'utf8');
  assert(!html.includes('SYNTHETIC_TEST_ONLY'),'测试示例进入产物');
  assert(!/\b(?:href|src)=["'](?:\/local\/|https:\/\/github\.com\/[^"']*\/releases|[^"']*\.(?:zip|rar|7z)(?:[?#][^"']*)?)["']/i.test(html),'产物包含未批准的资源入口');
  if(!videoPublicationEnabled){
   assert(!/<video\b|<source\b/i.test(html),`暂停公开时不能出现视频播放器：${full}`);
   assert(!/\b(?:href|src)="(?:\/videos\/|[^"<>]*\.(?:mp4|m4v|mov|webm|ogv|m3u8)(?:[?#][^"<>]*)?")/i.test(html),`暂停公开时不能出现视频播放或下载地址：${full}`);
  }
  for(const match of html.matchAll(/\b(?:href|src)="([^"<>]+)"/g)){
   const url=match[1];if(!url.startsWith('/')||url.startsWith('//'))continue;
   assert(existsSync(targetFor(url)),`失效站内链接 ${path.relative(dist,full)} → ${url}`);linkCount++;
  }
 }
}}
inspect(dist);
const report={pages:pageCount,checkedLocalLinks:linkCount,videoPublicationEnabled,published:published.map(e=>({id:e.id,category:e.data.category_id,type:e.data.type})),drafts:entries.filter(e=>e.data.status==='draft').map(e=>e.id),checks:['schema','local assets exist','seven category pages','draft detail pages absent','detail pages match publication policy','built internal links resolve',...(!videoPublicationEnabled?['no video players or playback links','video source copies excluded from output']:[])]};
mkdirSync(path.join(projectRoot,'.local-reports'),{recursive:true});
writeFileSync(path.join(projectRoot,'.local-reports/build-review.json'),JSON.stringify(report,null,2)+'\n');
console.log(`静态产物审查通过：${pageCount} 页，${linkCount} 个站内引用；报告 .local-reports/build-review.json。`);
