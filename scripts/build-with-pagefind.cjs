/* This is a script to build the site with Pagefind */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const os = require('os');

// 获取 CPU 核心数用于并行构建
const cpuCount = os.cpus().length;

// Detect the platform
function detectPlatform() {
  // Check environment variables
  if (process.env.VERCEL) {
    return 'vercel';
  }
  if (process.env.CF_PAGES) {
    return 'cloudflare';
  }
  if (process.env.EDGEONE) {
    return 'edgeone';
  }
  if (process.env.NETLIFY) {
    return 'netlify';
  }
  if (process.env.GITHUB_ACTIONS) {
    return 'github';
  }

  // Check if specific directories exist
  if (existsSync('.vercel')) {
    return 'vercel';
  }

  // Default to standard dist directory
  return 'default';
}

// Get Pagefind output directory
function getPagefindOutputDir(platform) {
  const outputDirs = {
    vercel: '.vercel/output/static',
    cloudflare: 'dist',
    edgeone: 'dist',
    netlify: 'dist',
    github: 'dist',
    default: 'dist'
  };

  return outputDirs[platform] || 'dist';
}

// Main function
function main() {
  const platform = detectPlatform();
  const outputDir = getPagefindOutputDir(platform);

  console.log(`🚀 Detected deployment platform: ${platform}`);
  console.log(`📁 Pagefind output directory: ${outputDir}`);
  console.log(`💻 CPU cores available: ${cpuCount}`);

  // 设置 Node.js 生产环境和优化选项
  const buildEnv = {
    ...process.env,
    NODE_ENV: 'production',
    // 增加 Node.js 内存限制以加速构建
    NODE_OPTIONS: '--max-old-space-size=4096',
  };

  try {
    // Run Astro build
    console.log('🔨 Running Astro build...');
    const startTime = Date.now();

    execSync(`npx astro build`.trim(), {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: buildEnv
    });

    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Astro build completed in ${buildTime}s`);

    // Check if output directory exists
    if (!existsSync(outputDir)) {
      console.error(`❌ Output directory does not exist: ${outputDir}`);
      process.exit(1);
    }

    // Run Pagefind
    console.log(`🔍 Running Pagefind search index generation...`);
    const pagefindStart = Date.now();

    execSync(`npx pagefind --site ${outputDir}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: buildEnv
    });

    const pagefindTime = ((Date.now() - pagefindStart) / 1000).toFixed(2);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('✅ Build completed!');
    console.log(`📊 Search index generated at: ${outputDir}/pagefind/`);
    console.log(`⏱️  Pagefind: ${pagefindTime}s | Total: ${totalTime}s`);

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();
