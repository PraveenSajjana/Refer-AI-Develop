const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Common technical skills database
const TECHNICAL_SKILLS = {
  languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less'],
  frontend: ['react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'redux', 'vuex', 'mobx', 'tailwind', 'bootstrap', 'material-ui', 'chakra'],
  backend: ['node.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'springboot', 'rails', 'laravel', 'asp.net', 'graphql', 'rest', 'api', 'microservices'],
  database: ['postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'sql server', 'dynamodb', 'cassandra', 'firebase', 'supabase'],
  devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud', 'ci/cd', 'jenkins', 'github actions', 'gitlab ci', 'terraform', 'ansible', 'linux', 'nginx', 'apache'],
  tools: ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'figma', 'postman', 'vscode', 'intellij', 'eclipse'],
  concepts: ['agile', 'scrum', 'tdd', 'bdd', 'oop', 'functional programming', 'data structures', 'algorithms', 'system design', 'distributed systems', 'machine learning', 'ai', 'deep learning'],
};

// Common soft skills
const SOFT_SKILLS = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'collaboration', 'adaptability', 'time management', 'project management', 'mentoring', 'presentation'];

// ATS keyword patterns by job category
const ATS_KEYWORDS = {
  general: ['experience', 'education', 'skills', 'projects', 'achievements', 'responsibilities', 'developed', 'implemented', 'designed', 'managed', 'led', 'created', 'built', 'optimized', 'improved'],
  engineering: ['software development', 'full stack', 'backend', 'frontend', 'api development', 'database design', 'system architecture', 'code review', 'testing', 'debugging', 'performance optimization', 'security', 'scalability'],
  data: ['data analysis', 'data visualization', 'statistics', 'machine learning', 'data pipeline', 'etl', 'reporting', 'analytics', 'insights', 'predictive modeling'],
  management: ['team lead', 'project delivery', 'stakeholder management', 'roadmap', 'strategy', 'budget', 'hiring', 'performance review', 'cross-functional', 'vendor management'],
};

// Action verbs for resume quality
const ACTION_VERBS = ['achieved', 'improved', 'developed', 'created', 'implemented', 'designed', 'built', 'launched', 'led', 'managed', 'increased', 'reduced', 'optimized', 'streamlined', 'automated', 'delivered', 'spearheaded', 'orchestrated', 'established', 'negotiated'];

// Parse PDF buffer
async function parsePDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parse error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

// Parse DOCX buffer
async function parseDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parse error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

// Extract skills from text
function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const foundSkills = {
    technical: [],
    soft: [],
  };

  // Check technical skills
  for (const category of Object.values(TECHNICAL_SKILLS)) {
    for (const skill of category) {
      const skillLower = skill.toLowerCase();
      // Use word boundary matching for more accuracy
      const regex = new RegExp(`\\b${skillLower.replace(/[.+]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText) && !foundSkills.technical.includes(skill)) {
        foundSkills.technical.push(skill);
      }
    }
  }

  // Check soft skills
  for (const skill of SOFT_SKILLS) {
    const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
    if (regex.test(lowerText) && !foundSkills.soft.includes(skill)) {
      foundSkills.soft.push(skill);
    }
  }

  return foundSkills;
}

// Extract experience years
function extractExperience(text) {
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|working)/gi,
    /(?:experience|working)\s*(?:of\s*)?(\d+)\+?\s*years?/gi,
  ];

  let maxYears = 0;
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const years = parseInt(match[1], 10);
      if (years > maxYears && years <= 30) {
        maxYears = years;
      }
    }
  }

  // Also look for date ranges
  const yearRangePattern = /((?:19|20)\d{2})\s*[-–to]+\s*((?:19|20)\d{2}|present|current|now)/gi;
  let rangeMatches = text.matchAll(yearRangePattern);
  for (const match of rangeMatches) {
    const startYear = parseInt(match[1], 10);
    const endYear = match[2].match(/\d{4}/) ? parseInt(match[2], 10) : new Date().getFullYear();
    const years = endYear - startYear;
    if (years > 0 && years <= 30 && years > maxYears) {
      maxYears = years;
    }
  }

  return maxYears;
}

// Extract education info
function extractEducation(text) {
  const education = [];
  const degrees = ['bachelor', 'master', 'phd', 'doctorate', 'b.tech', 'm.tech', 'b.e', 'm.e', 'mba', 'bs', 'ms', 'ba', 'ma'];
  const lowerText = text.toLowerCase();

  for (const degree of degrees) {
    const regex = new RegExp(`\\b${degree}[a-z]*\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => {
        if (!education.some(e => e.toLowerCase().includes(match.toLowerCase()))) {
          education.push(match);
        }
      });
    }
  }

  return education;
}

// Calculate ATS score
function calculateATSScore(text, skills) {
  let score = 0;
  let maxScore = 100;
  const lowerText = text.toLowerCase();

  // Check for essential sections (30 points)
  const sections = ['experience', 'education', 'skills', 'projects'];
  let sectionScore = 0;
  for (const section of sections) {
    if (lowerText.includes(section)) sectionScore += 7.5;
  }
  score += sectionScore;

  // Check for action verbs (20 points)
  let actionVerbCount = 0;
  for (const verb of ACTION_VERBS) {
    if (lowerText.includes(verb)) actionVerbCount++;
  }
  score += Math.min(20, actionVerbCount * 2);

  // Check for quantifiable achievements (15 points)
  const numberPattern = /\d+(?:%|\+|k|million|thousand|percent)/gi;
  const numberMatches = text.match(numberPattern);
  if (numberMatches && numberMatches.length >= 3) score += 15;
  else if (numberMatches && numberMatches.length >= 1) score += 7;

  // Check for technical keywords (25 points)
  const totalSkills = skills.technical.length + skills.soft.length;
  score += Math.min(25, totalSkills * 1.5);

  // Check for contact info (10 points)
  if (/@/.test(text)) score += 5; // email
  if (/\d{10,}/.test(text.replace(/\D/g, ''))) score += 5; // phone

  return Math.min(100, Math.round(score));
}

// Calculate resume quality score
function calculateResumeScore(text, skills, experienceYears) {
  let score = 0;

  // Length score (max 15 points)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 800) score += 15;
  else if (wordCount >= 200 && wordCount <= 1000) score += 10;
  else score += 5;

  // Skills diversity (max 25 points)
  score += Math.min(25, skills.technical.length * 1.5);

  // Experience (max 20 points)
  score += Math.min(20, experienceYears * 2);

  // Formatting quality (max 20 points)
  const hasBulletPoints = /[•\-\*]/.test(text);
  const hasSections = /experience|education|skills|projects/i.test(text);
  const hasDates = /(19|20)\d{2}/.test(text);
  if (hasBulletPoints) score += 7;
  if (hasSections) score += 7;
  if (hasDates) score += 6;

  // Soft skills (max 20 points)
  score += Math.min(20, skills.soft.length * 4);

  return Math.min(100, Math.round(score));
}

// Generate missing skills suggestions
function suggestMissingSkills(foundSkills) {
  const suggestions = [];
  const allTechSkills = Object.values(TECHNICAL_SKILLS).flat();

  // Suggest complementary skills
  const skillPairs = {
    'react': ['next.js', 'redux', 'typescript'],
    'node.js': ['express', 'mongodb', 'docker'],
    'python': ['django', 'fastapi', 'pandas'],
    'java': ['spring', 'maven', 'docker'],
    'aws': ['docker', 'kubernetes', 'terraform'],
  };

  for (const [skill, related] of Object.entries(skillPairs)) {
    if (foundSkills.technical.some(s => s.toLowerCase().includes(skill))) {
      for (const relatedSkill of related) {
        if (!foundSkills.technical.includes(relatedSkill)) {
          suggestions.push(relatedSkill);
        }
      }
    }
  }

  // Add some common missing skills if list is short
  if (suggestions.length < 5) {
    const commonMissing = ['git', 'docker', 'aws', 'agile', 'rest api'];
    for (const skill of commonMissing) {
      if (!foundSkills.technical.includes(skill) && !suggestions.includes(skill)) {
        suggestions.push(skill);
      }
    }
  }

  return [...new Set(suggestions)].slice(0, 8);
}

// Generate ATS improvement suggestions
function generateATSSuggestions(text, skills, atsScore) {
  const suggestions = [];
  const lowerText = text.toLowerCase();

  // Check for missing sections
  if (!lowerText.includes('summary') && !lowerText.includes('objective')) {
    suggestions.push('Add a professional summary section at the top of your resume');
  }

  // Check for action verbs
  const hasActionVerbs = ACTION_VERBS.some(verb => lowerText.includes(verb));
  if (!hasActionVerbs) {
    suggestions.push('Start bullet points with strong action verbs (e.g., "Developed", "Implemented", "Led")');
  }

  // Check for quantifiable results
  const hasNumbers = /\d+(?:%|\+|k|million)/i.test(text);
  if (!hasNumbers) {
    suggestions.push('Add quantifiable achievements with metrics (e.g., "Improved performance by 40%")');
  }

  // Check for skills section
  if (skills.technical.length < 5) {
    suggestions.push('Expand your skills section with more relevant technical keywords');
  }

  // Check for ATS keywords
  const missingKeywords = [];
  for (const [category, keywords] of Object.entries(ATS_KEYWORDS)) {
    for (const keyword of keywords) {
      if (!lowerText.includes(keyword.toLowerCase())) {
        missingKeywords.push(keyword);
      }
    }
  }

  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding industry keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  }

  // Formatting suggestions
  if (!/[•\-]/.test(text)) {
    suggestions.push('Use bullet points for better readability and ATS parsing');
  }

  // Education suggestions
  const education = extractEducation(text);
  if (education.length === 0) {
    suggestions.push('Add your educational qualifications with degree and institution');
  }

  return suggestions.slice(0, 6);
}

// Main analysis function
async function analyzeResume(buffer, fileType) {
  // Parse file to text
  let text;
  if (fileType === 'pdf') {
    text = await parsePDF(buffer);
  } else if (fileType === 'docx' || fileType === 'doc') {
    text = await parseDOCX(buffer);
  } else {
    throw new Error('Unsupported file type');
  }

  if (!text || text.trim().length < 50) {
    throw new Error('Could not extract text from resume. Please ensure the file contains readable text.');
  }

  // Extract information
  const skills = extractSkills(text);
  const experienceYears = extractExperience(text);
  const education = extractEducation(text);

  // Calculate scores
  const atsScore = calculateATSScore(text, skills);
  const resumeScore = calculateResumeScore(text, skills, experienceYears);

  // Generate suggestions
  const missingSkills = suggestMissingSkills(skills);
  const atsKeywordsMissing = Object.values(ATS_KEYWORDS)
    .flat()
    .filter(kw => !text.toLowerCase().includes(kw.toLowerCase()))
    .slice(0, 10);
  const suggestions = generateATSSuggestions(text, skills, atsScore);
  const atsSuggestions = atsKeywordsMissing.slice(0, 5).map(kw =>
    `Consider adding "${kw}" to improve ATS matching`
  );

  return {
    text: text.substring(0, 5000), // Store first 5000 chars
    resume_score: resumeScore,
    ats_score: atsScore,
    extracted_skills: skills.technical,
    soft_skills: skills.soft,
    missing_skills: missingSkills,
    experience_years: experienceYears,
    education_data: education,
    suggestions,
    ats_keywords_missing: atsKeywordsMissing,
    ats_suggestions: atsSuggestions,
  };
}

module.exports = {
  parsePDF,
  parseDOCX,
  extractSkills,
  extractExperience,
  extractEducation,
  calculateATSScore,
  calculateResumeScore,
  suggestMissingSkills,
  generateATSSuggestions,
  analyzeResume,
};
