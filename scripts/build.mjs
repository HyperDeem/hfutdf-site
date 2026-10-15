import { spawnSync } from 'node:child_process';
for(const args of [['scripts/validate-content.ts'],['scripts/astro.mjs','build'],['scripts/review-build.ts']]){
 const result=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});
 if(result.status!==0)process.exit(result.status??1);
}
