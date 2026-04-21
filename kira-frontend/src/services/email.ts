/**
 * Email Service
 * Email template generation and communication utilities
 */

export interface EmailTemplate {
  subject: string;
  body: string;
  isHtml?: boolean;
}

export class EmailService {
  /**
   * Generate initial outreach email subject
   */
  generateOutreachSubject(companyName: string): string {
    const subjects = [
      `Excited to connect with ${companyName}!`,
      `Let's discuss opportunities at ${companyName}`,
      `Quick introduction from a fellow enthusiast`,
      `Your ${companyName} job posting caught my attention`,
      `Interested in connecting about ${companyName}`,
    ];

    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  /**
   * Generate initial outreach email body
   */
  generateOutreachBody(hrName: string, companyName: string, role: string): EmailTemplate {
    const body = `Hi ${hrName},

I hope this message finds you well. I came across the ${role} position at ${companyName} and was impressed by your company's mission and the opportunity.

With my background in software development and passion for building impactful products, I believe I would be a great fit for your team. I'm particularly interested in ${companyName}'s approach to [specific area/technology].

I'd love to learn more about the role and discuss how I can contribute to your team's success. Feel free to reach out if you'd like to grab a quick call or chat about the position.

Looking forward to connecting!

Best regards,
Koushik`;

    return {
      subject: this.generateOutreachSubject(companyName),
      body,
    };
  }

  /**
   * Generate follow-up email
   */
  generateFollowUpEmail(hrName: string, daysSince: number): EmailTemplate {
    const body = `Hi ${hrName},

I hope you're doing well! I wanted to follow up on my previous message regarding the open position at your company.

I'm still very interested in the opportunity and would love to hear back from you. If you need any additional information about my qualifications or experience, please don't hesitate to reach out.

Looking forward to your response!

Best regards,
Koushik`;

    return {
      subject: `[Follow-up] Re: Application at your company`,
      body,
    };
  }

  /**
   * Generate interview confirmation email
   */
  generateInterviewConfirmationEmail(
    hrName: string,
    interviewDate: string,
    interviewTime: string
  ): EmailTemplate {
    const body = `Hi ${hrName},

Thank you for scheduling the interview! I'm excited to discuss the opportunity with you.

To confirm, the interview is scheduled for:
📅 Date: ${interviewDate}
⏰ Time: ${interviewTime}

I've blocked off the time and will be ready to join. If there are any materials you'd like me to review beforehand or any questions I should prepare for, please let me know.

Looking forward to our conversation!

Best regards,
Koushik`;

    return {
      subject: `Interview Confirmation - Thank you!`,
      body,
    };
  }

  /**
   * Generate thank you after interview email
   */
  generateThankYouEmail(hrName: string, companyName: string, topics: string[]): EmailTemplate {
    const topicsList = topics.map(t => `• ${t}`).join('\n');

    const body = `Hi ${hrName},

Thank you so much for taking the time to meet with me today. I truly enjoyed our conversation about the ${companyName} opportunity.

Our discussion about the following points was particularly valuable:
${topicsList}

I'm very enthusiastic about the possibility of joining your team and contributing to ${companyName}'s mission. Please don't hesitate to reach out if you need any additional information from my end.

I look forward to hearing from you soon!

Best regards,
Koushik`;

    return {
      subject: `Thank you for the interview opportunity!`,
      body,
    };
  }

  /**
   * Generate rejection follow-up email
   */
  generateRejectionFollowUpEmail(hrName: string, companyName: string): EmailTemplate {
    const body = `Hi ${hrName},

Thank you for the update regarding the ${companyName} position. While I'm disappointed, I'm grateful for the opportunity and the time your team took to consider my application.

I have enormous respect for ${companyName} and would be very interested in future opportunities that may be a better fit. I'd welcome the chance to stay in touch and would love to reconnect when new positions become available.

Best regards,
Koushik`;

    return {
      subject: `Thank you for considering my application`,
      body,
    };
  }

  /**
   * Format email for display
   */
  formatEmailForDisplay(template: EmailTemplate): string {
    return `Subject: ${template.subject}\n\n${template.body}`;
  }

  /**
   * Generate email chain summary
   */
  generateEmailSummary(emailCount: number, lastMessageDate: string): string {
    if (emailCount === 0) return 'No communications yet';
    if (emailCount === 1) return `${emailCount} message sent on ${lastMessageDate}`;
    return `${emailCount} messages exchanged, last on ${lastMessageDate}`;
  }
}

/**
 * Global email service instance
 */
export const emailService = new EmailService();

export default emailService;
