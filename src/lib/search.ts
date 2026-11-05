import type {EntryData} from '../content/schema.ts';
export type SearchRecord={id:string;title:string;description:string;filenames:string[];href:string};
export function originalFilename(url:string){
 try {const segment=new URL(url,'https://files.hfutdf.top').pathname.split('/').pop()||'';return decodeURIComponent(segment);}
 catch{return '';}
}
export function searchRecord(entry:{id:string;data:EntryData}):SearchRecord{
 const d=entry.data;
 const urls=d.type==='photo_album'?d.images.map(image=>image.src):('url' in d&&d.url?[d.url]:[]);
 return {id:entry.id,title:d.title,description:d.summary??d.note??'',filenames:urls.map(originalFilename).filter(Boolean),href:`/library/${d.category_id}/#resource-${entry.id}`};
}
const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().trim();
export function searchRecords(records:SearchRecord[],query:string){
 const q=normalize(query);if(!q)return [];
 return records.map((record,index)=>({record,index,rank:normalize(record.title).includes(q)?0:record.filenames.some(name=>normalize(name).includes(q))?1:normalize(record.description).includes(q)?2:3}))
  .filter(item=>item.rank<3).sort((a,b)=>a.rank-b.rank||a.index-b.index).map(item=>item.record);
}
