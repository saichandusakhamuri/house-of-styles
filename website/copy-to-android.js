// Copy all website files to Android app assets
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname);
const destDir = path.join(__dirname, '../android-app/HouseOfStylesApp/app/src/main/assets/www');

// Create destDir if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      // Skip node_modules and backend
      if (childItemName === 'node_modules' || childItemName === 'backend' || childItemName === '.git') {
        return;
      }
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(sourceDir, destDir);

console.log('✓ All website files copied to Android app assets/www');
