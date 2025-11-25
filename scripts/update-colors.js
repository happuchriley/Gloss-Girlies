// Script to update all purple colors to pink
// Run with: node scripts/update-colors.js

const fs = require('fs');
const path = require('path');

const colorMap = {
  'purple-50': 'pink-50',
  'purple-100': 'pink-100',
  'purple-200': 'pink-200',
  'purple-300': 'pink-300',
  'purple-400': 'pink-400',
  'purple-500': 'pink-500',
  'purple-600': 'pink-600',
  'purple-700': 'pink-700',
  'purple-800': 'pink-800',
  'purple-900': 'pink-900',
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      const regex = new RegExp(oldColor, 'g');
      if (content.includes(oldColor)) {
        content = content.replace(regex, newColor);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Update files
const appFiles = walkDir('./app');
const componentFiles = walkDir('./components');

let updatedCount = 0;
[...appFiles, ...componentFiles].forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✅ Updated ${updatedCount} files with new color scheme!`);

