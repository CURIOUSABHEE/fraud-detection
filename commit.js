const { execSync } = require('child_process');
const path = require('path');

const projectDir = r`D:\rebel\Projects\Mini Project 2026`;

try {
  // Change to project directory and execute git commands
  process.chdir(projectDir);
  
  // Stage README.md
  execSync('git add README.md', { stdio: 'inherit' });
  
  // Commit with message
  const commitMsg = `docs: remove support and roadmap sections from README

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;
  
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  
  console.log('✓ Commit successful!');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
