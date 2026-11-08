import { spawnSync } from 'node:child_process';
const result=spawnSync(process.execPath,['--test','tests/content.test.ts','tests/cos.test.ts','tests/search.test.ts','tests/media-probe.test.mjs','tests/subcategories.test.ts'],{stdio:'inherit',env:process.env});
process.exit(result.status??1);
