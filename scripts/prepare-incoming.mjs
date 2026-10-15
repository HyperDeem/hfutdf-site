import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync(new URL('../incoming/',import.meta.url),{recursive:true});
try{
 writeFileSync(new URL('../incoming/README.md',import.meta.url),'# 本地待整理区\n\n此目录被 Git 忽略，不会被网站构建读取，也不会自动发布。\n只在站长明确指定后整理对应文件。原件请另行备份；Git 不会备份这里。\n不要将未确认公开的文件复制到 public/。\n',{flag:'wx'});
}catch(error){if(error.code!=='EEXIST')throw error;}
