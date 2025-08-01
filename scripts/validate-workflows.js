#!/usr/bin/env node
// [AI]

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class WorkflowValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validateWorkflow(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const workflow = yaml.load(content);
      
      this.validateBasicStructure(workflow, filePath);
      this.validateJobs(workflow, filePath);
      this.checkCommonIssues(workflow, filePath);
      
      return {
        valid: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings
      };
    } catch (error) {
      this.errors.push(`Failed to parse ${filePath}: ${error.message}`);
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }
  }

  validateBasicStructure(workflow, filePath) {
    if (!workflow.name) {
      this.errors.push(`${filePath}: Missing required 'name' field`);
    }
    
    if (!workflow.on) {
      this.errors.push(`${filePath}: Missing required 'on' field`);
    }
    
    if (!workflow.jobs || Object.keys(workflow.jobs).length === 0) {
      this.errors.push(`${filePath}: Missing or empty 'jobs' field`);
    }
  }

  validateJobs(workflow, filePath) {
    if (!workflow.jobs) return;
    
    Object.entries(workflow.jobs).forEach(([jobName, job]) => {
      if (!job['runs-on']) {
        this.errors.push(`${filePath}: Job '${jobName}' missing 'runs-on' field`);
      }
      
      if (!job.steps && !job.uses) {
        this.errors.push(`${filePath}: Job '${jobName}' must have either 'steps' or 'uses' field`);
      }
    });
  }

  checkCommonIssues(workflow, filePath) {
    // Check for potential permission issues
    if (workflow.on?.pull_request_target && !workflow.permissions) {
      this.warnings.push(`${filePath}: Using pull_request_target without explicit permissions`);
    }
    
    // Check for hardcoded secrets
    const content = JSON.stringify(workflow);
    if (content.includes('ghp_') || content.includes('github_pat_')) {
      this.errors.push(`${filePath}: Potential hardcoded GitHub token detected`);
    }
  }
}



function main() {
  const workflowsDir = '.github/workflows';
  
  if (!fs.existsSync(workflowsDir)) {
    console.log('No .github/workflows directory found');
    return;
  }
  
  const validator = new WorkflowValidator();
  const files = fs.readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map(file => path.join(workflowsDir, file));
  
  console.log(`🔍 Validating ${files.length} workflow files...\n`);
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  files.forEach(file => {
    const result = validator.validateWorkflow(file);
    
    if (result.valid) {
      console.log(`✅ ${file} - Valid`);
    } else {
      console.log(`❌ ${file} - Invalid`);
      result.errors.forEach(error => console.log(`   Error: ${error}`));
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => console.log(`   Warning: ${warning}`));
    }
    
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    
    // Reset for next file
    validator.errors = [];
    validator.warnings = [];
  });
  
  console.log(`\n📊 Summary: ${totalErrors} errors, ${totalWarnings} warnings`);
  
  if (totalErrors > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { WorkflowValidator };
