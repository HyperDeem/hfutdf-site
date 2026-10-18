import { getCollection, type CollectionEntry } from 'astro:content';
export type ContentEntry = CollectionEntry<'entries'>;
export type EntryRow = {title:string;note:string;action:string;href?:string;download?:boolean;unavailable?:boolean;external?:boolean};
export async function publishedEntries(){
  return (await getCollection('entries',({data})=>data.status==='published'&&!data.demo))
    .sort((a,b)=>a.data.order-b.data.order || a.id.localeCompare(b.id,'en'));
}
export function titleOf(entry:ContentEntry){return entry.data.demo?`${entry.data.title}（模拟）`:entry.data.title;}
export function entryUrl(entry:ContentEntry){
  return `/${entry.data.type==='photo_album'?'photos':entry.data.type==='video'?'videos':'entry'}/${entry.id}/`;
}
export function toRow(entry:ContentEntry):EntryRow{
  const d=entry.data;
  if(d.type==='article')return {title:titleOf(entry),note:d.note||(d.demo?'阅读 · 模拟文章':'阅读'),action:'阅读',href:entryUrl(entry)};
  if(d.type==='video'){
    return {title:titleOf(entry),note:d.note||'比赛文字记录',action:'暂不开放资源',unavailable:true};
  }
  const action=d.type==='file'?'下载':d.type==='link'?'访问链接':d.type==='tool'?{open:'打开',download:'下载',external:'访问链接'}[d.action]:'查看';
  const href=(d.type==='file' || (d.type==='tool'&&d.action!=='external'))?d.url:undefined;
  return {title:titleOf(entry),note:d.note||'',action,href,download:d.type==='file'||(d.type==='tool'&&d.action==='download')};
}
