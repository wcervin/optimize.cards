#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateCSS(cssContent) {
  const issues = [];
  
  // Check for missing webkit prefixes
  const backdropFilterRegex = /backdrop-filter\s*:/g;
  const webkitBackdropFilterRegex = /-webkit-backdrop-filter\s*:/g;
  
  if (cssContent.match(backdropFilterRegex) && !cssContent.match(webkitBackdropFilterRegex)) {
    issues.push('Missing -webkit-backdrop-filter prefix for backdrop-filter properties');
  }
  
  // Check for invalid calc() syntax
  const calcRegex = /calc\s*\(\s*[^)]*\)/g;
  const invalidCalcMatches = cssContent.match(calcRegex);
  if (invalidCalcMatches) {
    invalidCalcMatches.forEach(match => {
      if (!match.includes('calc(')) {
        issues.push(`Invalid calc() syntax: ${match}`);
      }
    });
  }
  
  // Check for missing semicolons before closing braces
  const missingSemicolonRegex = /[^;]\s*}/g;
  const missingSemicolonMatches = cssContent.match(missingSemicolonRegex);
  if (missingSemicolonMatches) {
    issues.push(`Potential missing semicolons before closing braces: ${missingSemicolonMatches.length} instances`);
  }
  
  // Check for valid CSS custom properties
  const customPropertyRegex = /var\s*\(\s*--[^)]+\)/g;
  const customProperties = cssContent.match(customPropertyRegex);
  if (customProperties) {
    console.log('✅ CSS custom properties found:', customProperties.length);
  }
  
  // Check for responsive design patterns
  const mediaQueryRegex = /@media\s*\([^)]+\)/g;
  const mediaQueries = cssContent.match(mediaQueryRegex);
  if (mediaQueries) {
    console.log('✅ Media queries found:', mediaQueries.length);
  }
  
  return issues;
}

function main() {
  try {
    const cssPath = path.join(__dirname, '..', 'src', 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    console.log('🔍 Validating CSS file...');
    console.log(`📁 File: ${cssPath}`);
    console.log(`📏 Size: ${(cssContent.length / 1024).toFixed(2)} KB`);
    
    const issues = validateCSS(cssContent);
    
    if (issues.length === 0) {
      console.log('✅ CSS validation passed - No issues found!');
      process.exit(0);
    } else {
      console.error('❌ CSS validation failed:');
      issues.forEach(issue => console.error(`  - ${issue}`));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during CSS validation:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
