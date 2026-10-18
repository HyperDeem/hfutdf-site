// Legacy command name retained. Read-only inventory; never imports into public/.
import {readdirSync,readFileSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const directory=process.argv[2];
if(!directory){console.error('用法：node scripts/import-acceptance-files.mjs <本地私有目录>；只输出匿名编号、大小和哈希，不复制、不发布。');process.exitCode=1;}
else{
 const rows=[];
 for(const name of readdirSync(directory).sort()){
  const file=path.join(directory,name),stat=lstatSync(file);
  if(stat.isSymbolicLink())throw new Error('不读取符号链接');
  if(!stat.isFile())continue;
  rows.push({id:`file-${rows.length+1}`,bytes:stat.size,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});
 }
 console.log(JSON.stringify({scope:'local-read-only-no-copy-no-publication',files:rows},null,2));
}
