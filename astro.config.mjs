import { defineConfig } from 'astro/config';
import {fileURLToPath} from 'node:url';
import {readdirSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {videoPublicationEnabled} from './src/lib/publication.ts';

// Astro copies public/ verbatim. Strip video copies from output while retaining
// originals and player source locally. This also applies to direct astro builds.
export default defineConfig({
 output: 'static',
 devToolbar: { enabled: false },
 integrations: [{
  name: 'paused-video-publication',
  hooks: {'astro:build:done': ({dir,logger})=>{
   if(videoPublicationEnabled)return;
   let removed=0;
   function strip(directory){
    for(const entry of readdirSync(directory,{withFileTypes:true})){
     if(entry.isSymbolicLink())throw new Error('构建产物含符号链接，停止视频排除处理');
     const target=path.join(directory,entry.name);
     if(entry.isDirectory())strip(target);
     else if(/\.(mp4|m4v|mov|webm|ogv|avi|mkv|m3u8|m4s)$/i.test(entry.name)){unlinkSync(target);removed++;}
    }
   }
   strip(fileURLToPath(dir));
   logger.info(`视频公开暂停：已从构建目录排除 ${removed} 个视频文件，源文件保留。`);
  }},
 }],
});
