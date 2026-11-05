import { spawnSync } from 'node:child_process';
import { readEntries } from './validate-content.ts';
import { reviewBuild } from './review-build.ts';
// Validate the complete batch once and reuse it for the output review.
const entries=readEntries();
console.log(`内容校验通过：${entries.length} 条，${entries.filter(e=>e.data.status==='published').length} 条展示，${entries.filter(e=>e.data.status==='draft').length} 条草稿。`);
const result=spawnSync(process.execPath,['scripts/astro.mjs','build'],{stdio:'inherit',env:process.env});
if(result.status!==0)process.exit(result.status??1);
reviewBuild(entries);
