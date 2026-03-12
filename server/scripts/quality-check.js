// Path: E:\EduQuest\server\scripts\quality-check.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Running EduQuest Quality Checks...\n');

let passedChecks = 0;
let totalChecks = 0;

function check(name, condition) {
  totalChecks++;
  if (condition) {
    console.log(`✅ ${name}`);
    passedChecks++;
  } else {
    console.log(`❌ ${name}`);
  }
}

// Check files exist
check('README.md exists', fs.existsSync('README.md'));
check('API.md exists', fs.existsSync('API.md'));
check('.env exists', fs.existsSync('.env'));
check('Docker files exist', fs.existsSync('Dockerfile') && fs.existsSync('docker-compose.yml'));
check('Jest config exists', fs.existsSync('jest.config.js'));
check('Prisma schema exists', fs.existsSync('prisma/schema.prisma'));

// Check package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check('Package version is 2.0.0', pkg.version === '2.0.0');
check('Test scripts exist', pkg.scripts.test && pkg.scripts['test:unit']);
check('Docker scripts exist', pkg.scripts['docker:build'] && pkg.scripts['docker:up']);

// Check dependencies
const requiredDeps = [
  'express', 'prisma', '@prisma/client', 'bcrypt', 'jsonwebtoken',
  'cors', 'helmet', 'compression', 'winston', 'ioredis', 'socket.io',
  'multer', 'nodemailer', 'express-rate-limit', 'fuse.js'
];

requiredDeps.forEach(dep => {
  check(`Dependency: ${dep}`, pkg.dependencies[dep]);
});

// Check folder structure
const requiredFolders = [
  'src/config',
  'src/middleware',
  'src/routes',
  'src/routes/v1',
  'src/routes/v2',
  'prisma',
  'tests',
];

requiredFolders.forEach(folder => {
  check(`Folder: ${folder}`, fs.existsSync(folder));
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`QUALITY CHECK SUMMARY: ${passedChecks}/${totalChecks} passed`);
console.log(`${'='.repeat(50)}`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 All quality checks passed! Ready for production!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Review above.');
  process.exit(1);
}