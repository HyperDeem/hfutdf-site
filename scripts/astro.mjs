import { spawnSync } from 'node:child_process';
process.env.ASTRO_TELEMETRY_DISABLED = '1';
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', ...process.argv.slice(2)], {stdio:'inherit', env:process.env});
process.exit(result.status ?? 1);
