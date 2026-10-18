import {readdirSync,existsSync,statSync} from 'node:fs';
import path from 'node:path';
import type {ContentRecord} from './validate-content.ts';
const blockedMedia=/\.(?:mp4|m4v|mov|webm|ogv|avi|mkv|m3u8|m4s|zip|rar|7z|tar|gz)$/i;
export function assertPublicFiles(root:string,approvedFiles:readonly string[]=[]){
 if(!existsSync(root))throw new Error('缺少静态目录');
 const actual:string[]=[];
 function walk(dir:string){for(const item of readdirSync(dir,{withFileTypes:true})){
  if(item.isSymbolicLink())throw new Error('静态目录不允许符号链接');
  const full=path.join(dir,item.name),relative=path.relative(root,full).split(path.sep).join('/');
  if(relative==='local'||relative.startsWith('local/'))throw new Error('本地资料不得进入静态目录');
  if(item.isDirectory())walk(full);
  else if(relative==='.gitkeep'){
   if(statSync(full).size!==0)throw new Error('静态占位文件必须为空');
  }else{
   if(blockedMedia.test(relative))throw new Error('比赛媒体与压缩包发布仍暂停');
   if(!approvedFiles.includes(relative))throw new Error('静态目录包含未列入批准清单的文件');
   actual.push(relative);
  }
 }}
 walk(root);
 for(const file of approvedFiles)if(!actual.includes(file))throw new Error('批准清单引用缺失静态文件');
}
export function assertProductionEntries(entries:readonly ContentRecord[],approvedIds:readonly string[]=[]){
 for(const entry of entries){
  if(entry.data.demo)throw new Error('测试示例不得放入生产内容目录');
  if(!approvedIds.includes(entry.id))throw new Error('生产条目未经维护者批准');
  if(entry.data.category_id==='videos'&&'url' in entry.data&&entry.data.url)throw new Error('比赛记录暂不开放资源地址');
 }
 for(const id of approvedIds)if(!entries.some(entry=>entry.id===id))throw new Error('批准清单引用缺失条目');
}
