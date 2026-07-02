// Spawns the Next.js CLI directly (no .bin/*.cmd shim), so this works
// regardless of the terminal's console code page (avoids mojibake issues
// with non-ASCII project paths). Also sets NODE_OPTIONS=--no-webstorage,
// required on Node >=22 where the global localStorage stub throws
// "localStorage.getItem is not a function" during SSR.
const path = require('path');
const { spawnSync } = require('child_process');

const nextPkgPath = require.resolve('next/package.json');
const nextBin = path.join(path.dirname(nextPkgPath), 'dist', 'bin', 'next');

const env = { ...process.env };

// if (Number(process.versions.node.split('.')[0]) >= 22) {
//   env.NODE_OPTIONS = [env.NODE_OPTIONS, '--no-webstorage']
//     .filter(Boolean)
//     .join(' ');
// }

const result = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
});

process.exit(result.status ?? 1);
