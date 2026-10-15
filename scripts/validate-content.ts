import { readFileSync, readdirSync, statSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { entrySchema, type EntryData } from '../src/content/schema.ts';

export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicRoot=path.join(projectRoot,'public');
export type ContentRecord={id:string;data:EntryData;body:string};
export function readEntries():ContentRecord[]{
  const directory=path.join(projectRoot,'src/content/entries');
  return readdirSync(directory).filter(name=>name.endsWith('.md')).sort().map(name=>{
    try{
      const id=name.slice(0,-3);
      if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw new Error('文件名必须为小写英文或数字，以短横线连接');
      const text=readFileSync(path.join(directory,name),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
      const match=text.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
      if(!match)throw new Error('文件开头需要 --- 包围的 YAML 元数据');
      const data=entrySchema.parse(parse(match[1]));
      const body=match[2].trim();
      if(data.type==='article'&&!body)throw new Error('文章正文不能为空');
      const assets=data.type==='photo_album'?data.images.map(image=>image.src):('url' in data&&data.type!=='link'&&data.url?[data.url]:[]);
      for(const asset of assets){
        const target=realpathSync(path.join(publicRoot,asset.slice(1)));
        const relative=path.relative(realpathSync(publicRoot),target);
        if(relative.startsWith('..')||path.isAbsolute(relative)||!statSync(target).isFile())throw new Error(`本地资源必须是 public 内的文件：${asset}`);
      }
      return {id,data,body};
    }catch(error){throw new Error(`${name}: ${error instanceof Error?error.message:String(error)}`);}
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const entries=readEntries();console.log(`内容校验通过：${entries.length} 条，${entries.filter(e=>e.data.status==='published').length} 条展示，${entries.filter(e=>e.data.status==='draft').length} 条草稿。`);}
  catch(error){console.error(error instanceof Error?error.message:error);process.exitCode=1;}
}
