import {defineConfig} from 'astro/config';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url));
export default defineConfig({
 output:'static',
 devToolbar:{enabled:false},
 integrations:[{
  name:'approved-public-content-only',
  hooks:{'astro:config:setup':()=>{
   // Validate before Astro starts a server or copies public/. No files deleted.
   const result=spawnSync(process.execPath,['scripts/validate-content.ts'],{cwd:root,stdio:'inherit'});
   if(result.status!==0)throw new Error('公开内容检查未通过，停止启动或构建');
  }},
 }],
});
