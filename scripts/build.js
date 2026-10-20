import { execSync } from 'child_process';

console.log('[Build] 1/3 Building Vite frontend bundle...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('[Build] 2/3 Installing server dependencies...');
execSync('npm --prefix server install --include=dev', { stdio: 'inherit' });

console.log('[Build] 3/3 Compiling backend TypeScript...');
execSync('npm --prefix server run build', { stdio: 'inherit' });

console.log('[Build] Full-stack production build complete!');