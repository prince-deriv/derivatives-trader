#!/usr/bin/env node

/**
 * Generate AI Code Analysis Dashboard
 * 
 * Reads from stored JSON data to create a beautiful Markdown dashboard
 * This is FAST - no API calls needed!
 */

const fs = require('fs');

function generateMarkdown(stats, analyses, repo) {
  const lastUpdate = new Date().toISOString().split('T')[0];
  
  return `# 🤖 AI Code Analysis Dashboard

<div align="center">

**${repo}**  
📅 Last updated: ${lastUpdate} • 🔄 Tracking merged PRs to main/master

</div>

---

## 📊 Quick Stats

| Metric | Value | Metric | Value |
|--------|-------|--------|-------|
| **📁 Total Merged PRs** | ${stats.totalMergedPRs} | **📈 Average AI Code** | ${stats.averageAiPercentage}% |
| **🤖 PRs with AI Analysis** | ${stats.totalAnalyzedPRs} | **🎯 Overall AI Percentage** | ${Math.round((stats.totalAiCharacters / stats.totalCharacters) * 100) || 0}% |
| **📄 Files Analyzed** | ${stats.totalFiles.toLocaleString()} | **⚡ Total AI Characters** | ${stats.totalAiCharacters.toLocaleString()} |

---

${analyses.length === 0 ? `
## 📈 Ready to Track AI Code

> 🚀 **Getting Started**: When you merge PRs with AI analysis, they'll appear here!  
> 💡 Create a PR with \`[AI]\` wrapped code to get started.

---
` : `
## 📊 Recent Activity & Trends

<details>
<summary><strong>📈 Click to view trend analysis</strong></summary>

### 🔥 Recent Activity (Last 30 Days)
- **Recent PRs**: ${analyses.filter(a => {
  const date = new Date(a.mergedAt || a.timestamp);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return date > thirtyDaysAgo;
}).length}
- **Highest AI % (recent)**: ${Math.max(...analyses.slice(0, 10).map(a => a.summary ? a.summary.percentage : 0))}%
- **Most active author**: ${(() => {
  const authors = {};
  analyses.forEach(a => authors[a.author] = (authors[a.author] || 0) + 1);
  return Object.keys(authors).reduce((a, b) => authors[a] > authors[b] ? a : b, 'N/A');
})()}

### 🎯 AI Usage Distribution
- **PRs with 0% AI**: ${analyses.filter(a => a.summary && a.summary.percentage === 0).length}
- **PRs with >50% AI**: ${analyses.filter(a => a.summary && a.summary.percentage > 50).length}
- **Total AI characters**: ${stats.totalAiCharacters.toLocaleString()}

</details>

---

## 🚀 Merged Pull Requests

> 📊 AI code percentage for all merged PRs (newest first)

| PR | Author | Date | Files | AI Content | Percentage |
|----|--------|------|-------|------------|------------|${analyses.slice(0, 50).map(analysis => {
  const percentage = analysis.summary ? analysis.summary.percentage : 0;
  const date = new Date(analysis.mergedAt || analysis.timestamp).toLocaleDateString();
  const hasAnalysis = analysis.hasAnalysis !== false;
  
  // Create progress bar
  const createProgressBar = (pct) => {
    const width = 20;
    const filled = Math.round((pct / 100) * width);
    const empty = width - filled;
    let emoji = '⚪';
    if (pct > 50) emoji = '⚡';  // Peak AI Efficiency
    else if (pct > 20) emoji = '🚀';  // Strong AI Productivity
    else if (pct > 0) emoji = '🌱';   // AI-Assisted Development
    else emoji = '📝';  // Manual Coding
    
    return emoji + ' ' + '█'.repeat(filled) + '░'.repeat(empty) + ` ${pct}%`;
  };
  
  return `
| [#${analysis.pullRequest}](${analysis.prUrl}) **${analysis.prTitle}** ![MERGED](https://img.shields.io/badge/MERGED-28a745?style=flat-square) | [@${analysis.author}](https://github.com/${analysis.author}) | ${date} | ${hasAnalysis ? analysis.files.length : 'N/A'} | ${hasAnalysis ? (analysis.summary.aiCharacters || 0).toLocaleString() + ' / ' + (analysis.summary.totalCharacters || 0).toLocaleString() + ' chars' : 'No data'} | ${createProgressBar(percentage)} |`;
}).join('')}

`}

---

<details>
<summary><strong>📊 View detailed visual breakdown</strong></summary>

### 📈 AI Usage Chart

\`\`\`
AI Percentage Distribution:
${analyses.length > 0 ? analyses.slice(0, 20).map((analysis, index) => {
  const percentage = analysis.summary ? analysis.summary.percentage : 0;
  const title = analysis.prTitle.length > 30 ? analysis.prTitle.substring(0, 27) + '...' : analysis.prTitle;
  const padding = ' '.repeat(Math.max(0, 30 - title.length));
  const barLength = 40;
  const filled = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  return `PR #${analysis.pullRequest} ${title}${padding} │${bar}│ ${percentage}%`;
}).join('\n') : 'No data available yet'}
\`\`\`

### 🎯 Summary Statistics

\`\`\`
Total Characters:     ${stats.totalCharacters.toLocaleString()}
AI Characters:        ${stats.totalAiCharacters.toLocaleString()}
Human Characters:     ${(stats.totalCharacters - stats.totalAiCharacters).toLocaleString()}

AI vs Human Ratio:    ${Math.round((stats.totalAiCharacters / stats.totalCharacters) * 100) || 0}% : ${100 - Math.round((stats.totalAiCharacters / stats.totalCharacters) * 100) || 100}%
\`\`\`

</details>

---

<div align="center">

🚀 **Generated by ShiftAI** • [View Workflow](https://github.com/${repo}/actions) • [View Source](https://github.com/${repo})

*Automatically tracks all PRs merged to main/master branch with AI code analysis data*

</div>`;
}

async function main() {
  const REPO = process.env.GITHUB_REPOSITORY || 'your-org/repo';
  
  console.log('🚀 Generating AI Dashboard for ' + REPO + ' (from stored data)');
  
  // Check if historical data exists
  if (!fs.existsSync('.github/data/ai-analysis-history.json')) {
    console.log('⚠️  No historical data found, creating empty dashboard');
    
    const emptyStats = {
      totalMergedPRs: 0,
      totalAnalyzedPRs: 0,
      totalFiles: 0,
      totalCharacters: 0,
      totalAiCharacters: 0,
      averageAiPercentage: 0
    };
    
    const markdown = generateMarkdown(emptyStats, [], REPO);
    fs.writeFileSync('AI-DASHBOARD.md', markdown);
    console.log('✅ Empty dashboard generated');
    return;
  }
  
  // Read historical data (much faster than scanning PRs!)
  const history = JSON.parse(fs.readFileSync('.github/data/ai-analysis-history.json', 'utf8'));
  
  // Generate statistics from stored data
  const analyses = history.analyses.filter(a => a.hasAnalysis !== false);
  const stats = {
    totalMergedPRs: history.totalMergedPRs,
    totalAnalyzedPRs: analyses.length,
    totalFiles: analyses.reduce((sum, a) => sum + (a.files ? a.files.length : 0), 0),
    totalCharacters: analyses.reduce((sum, a) => sum + (a.summary ? a.summary.totalCharacters : 0), 0),
    totalAiCharacters: analyses.reduce((sum, a) => sum + (a.summary ? a.summary.aiCharacters : 0), 0),
    averageAiPercentage: analyses.length ? Math.round(analyses.reduce((sum, a) => sum + (a.summary ? a.summary.percentage : 0), 0) / analyses.length) : 0
  };
  
  console.log('📊 Dashboard stats:');
  console.log('   Total merged PRs: ' + stats.totalMergedPRs);
  console.log('   PRs with analysis: ' + stats.totalAnalyzedPRs);
  console.log('   Average AI %: ' + stats.averageAiPercentage + '%');
  
  // Generate Markdown from stored data
  const markdown = generateMarkdown(stats, history.analyses, REPO);
  
  // Save dashboard
  fs.writeFileSync('AI-DASHBOARD.md', markdown);
  console.log('✅ Dashboard generated from ' + history.totalMergedPRs + ' stored PRs (no API calls needed!)');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateMarkdown }; 