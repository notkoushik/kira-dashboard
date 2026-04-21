/**
 * AI Service
 * Job matching, scoring, and recommendation logic
 */

import { TECH_SKILLS } from '../config/constants';

export interface JobScore {
  score: number;
  matchedKeywords: string[];
  reasoning: string;
}

export class AIService {
  /**
   * Score a job based on tech stack and role
   */
  scoreJob(role: string, company: string, userTechStack?: string[]): JobScore {
    if (!userTechStack || userTechStack.length === 0) {
      return {
        score: 50,
        matchedKeywords: [],
        reasoning: 'No tech stack provided for scoring',
      };
    }

    const jobText = `${role} ${company}`.toLowerCase();
    const userSkills = userTechStack.map(s => s.toLowerCase());

    let score = 0;
    const matchedKeywords: string[] = [];

    // Check for exact matches in tech skills
    Object.entries(TECH_SKILLS).forEach(([skill, weight]) => {
      if (userSkills.includes(skill) && jobText.includes(skill)) {
        score += weight;
        matchedKeywords.push(skill);
      }
    });

    // Check for partial matches
    userSkills.forEach(skill => {
      if (
        !matchedKeywords.includes(skill) &&
        jobText.includes(skill) &&
        skill.length > 2
      ) {
        score += 5;
        matchedKeywords.push(skill);
      }
    });

    // Cap score at 100
    score = Math.min(Math.round(score), 100);

    // Generate reasoning
    let reasoning = '';
    if (score >= 80) {
      reasoning = 'Excellent match! Your skills align well with this role.';
    } else if (score >= 60) {
      reasoning = 'Good match. You have most of the required skills.';
    } else if (score >= 40) {
      reasoning = 'Moderate match. You have some relevant skills.';
    } else if (score >= 20) {
      reasoning = 'Potential fit. You may need to learn some skills.';
    } else {
      reasoning = 'Long shot. Consider upskilling if interested.';
    }

    return {
      score,
      matchedKeywords,
      reasoning,
    };
  }

  /**
   * Get color for score
   */
  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // success (green)
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // warning (amber)
    if (score >= 20) return '#ef4444'; // danger (red)
    return '#6b7280'; // muted (gray)
  }

  /**
   * Generate job fit reason
   */
  generateFitReason(role: string, skills: string[]): string[] {
    const reasons: string[] = [];

    // Check for seniority
    if (role.toLowerCase().includes('senior')) {
      reasons.push('Senior-level role');
    } else if (role.toLowerCase().includes('junior')) {
      reasons.push('Good starting point for beginners');
    }

    // Check for leadership
    if (role.toLowerCase().includes('lead') || role.toLowerCase().includes('manager')) {
      reasons.push('Leadership opportunity');
    }

    // Check for specialization
    if (role.toLowerCase().includes('full-stack')) {
      reasons.push('Full-stack role - diverse skillset required');
    } else if (role.toLowerCase().includes('frontend')) {
      reasons.push('Frontend focused');
    } else if (role.toLowerCase().includes('backend')) {
      reasons.push('Backend focused');
    }

    // Check for remote
    if (role.toLowerCase().includes('remote')) {
      reasons.push('Remote opportunity');
    }

    return reasons.length > 0 ? reasons : ['Standard role'];
  }

  /**
   * Rank jobs by fit
   */
  rankJobs(
    jobs: Array<{ role: string; company: string }>,
    userTechStack: string[]
  ): Array<{ ...any; score: number | StrictAny }> {
    return jobs
      .map(job => ({
        ...job,
        score: this.scoreJob(job.role, job.company, userTechStack).score,
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  /**
   * Get priority suggestion
   */
  getPrioritySuggestion(score: number): 1 | 2 | 3 {
    if (score >= 70) return 3; // High priority
    if (score >= 40) return 2; // Medium priority
    return 1; // Low priority
  }

  /**
   * Suggest jobs to apply to
   */
  suggestApplications(
    jobs: Array<{ id: string; role: string; company: string }>,
    userTechStack: string[],
    limit: number = 5
  ): Array<{ ...any; score: number | StrictAny; priority: number }> {
    return this.rankJobs(jobs, userTechStack)
      .slice(0, limit)
      .map(job => ({
        ...job,
        priority: this.getPrioritySuggestion(job.score as number),
      }));
  }
}

/**
 * Global AI service instance
 */
export const aiService = new AIService();

export default aiService;
