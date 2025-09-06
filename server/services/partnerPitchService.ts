export class PartnerPitchService {
  generatePitchDeck(): {
    slides: Array<{
      title: string;
      content: string[];
      callToAction?: string;
    }>;
    emailTemplate: string;
  } {
    const slides = [
      {
        title: "The Problem: CIPC Compliance is Killing Your Margins",
        content: [
          "• Manual CIPC filings take 2-4 hours per client",
          "• High risk of errors = potential penalties for clients",
          "• Low-margin work that doesn't scale",
          "• Takes time away from high-value advisory services",
          "• Clients frustrated with delays and complexity"
        ]
      },
      {
        title: "The Solution: AI-Powered CIPC Automation",
        content: [
          "• Our AI handles 100% of CIPC filings automatically",
          "• 90-second compliance checks via WhatsApp",
          "• Zero errors, guaranteed compliance",
          "• Your clients get instant service",
          "• You focus on strategic advisory work"
        ]
      },
      {
        title: "How the Partnership Works",
        content: [
          "• You refer clients through your unique link",
          "• Our AI bot handles all compliance work",
          "• Clients get 10% discount (your value-add)",
          "• You earn 20% lifetime commission on every filing",
          "• White-label option available for Enterprise partners"
        ]
      },
      {
        title: "The Numbers: Real Revenue Opportunity",
        content: [
          "• Average client spends R2,400/year on compliance",
          "• Your commission: R480 per client per year",
          "• Refer 50 clients = R24,000 annual recurring revenue",
          "• Refer 100 clients = R48,000 annual recurring revenue",
          "• Zero ongoing work required from you"
        ]
      },
      {
        title: "Next Steps: Join the Partner Program",
        content: [
          "• Sign up takes 2 minutes",
          "• Get your unique referral link instantly",
          "• Start earning from day one",
          "• Full marketing support provided",
          "• Dedicated partner success manager"
        ],
        callToAction: "Ready to start? Sign up at: https://cipcagent.co.za/partners"
      }
    ];

    const emailTemplate = `Subject: Partnership Opportunity: Earn R480+ per client with zero work

Hi [PARTNER_NAME],

I hope this email finds you well. I'm reaching out because I believe there's a significant opportunity for [FIRM_NAME] to increase revenue while reducing workload.

**The Challenge You're Facing:**
CIPC compliance work is time-consuming, low-margin, and high-risk. It takes your team away from valuable advisory services that clients actually want to pay premium rates for.

**The Solution:**
We've built South Africa's first AI-powered CIPC compliance platform. It handles everything automatically - from beneficial ownership filings to annual returns - in under 90 seconds via WhatsApp.

**The Partnership Opportunity:**
• Refer your clients to our platform
• They get 10% discount (your value-add)
• You earn 20% lifetime commission on every filing
• Average client value: R2,400/year = R480 commission per client
• Zero ongoing work required from you

**Real Numbers:**
If you refer just 50 clients, that's R24,000 in annual recurring revenue with zero additional work.

**What's Included:**
✅ Unique referral tracking link
✅ Marketing materials and email templates
✅ Dedicated partner success manager
✅ White-label option for larger firms

**Next Step:**
I'd love to show you a quick 10-minute demo of how this works. Are you available for a brief call this week?

Alternatively, you can sign up instantly at: https://cipcagent.co.za/partners

Best regards,
[YOUR_NAME]
CIPC Agent Partnership Team

P.S. We're currently onboarding our first 50 partners with enhanced commission rates. This offer won't be available much longer.`;

    return { slides, emailTemplate };
  }

  generatePartnerOnboardingSequence(partnerType: 'referral' | 'reseller' | 'enterprise'): {
    emails: Array<{
      day: number;
      subject: string;
      content: string;
    }>;
  } {
    const baseSequence = [
      {
        day: 0,
        subject: "Welcome to the CIPC Agent Partner Program! 🚀",
        content: `Welcome aboard! Your referral link is ready: https://cipcagent.co.za/ref/[REFERRAL_CODE]

Here's what happens next:
1. Share your link with clients
2. They get 10% discount automatically
3. You earn 20% commission on every filing
4. Track everything in your partner dashboard

Questions? Reply to this email anytime.`
      },
      {
        day: 3,
        subject: "Quick Start Guide: Your First Referral",
        content: `Ready to make your first referral? Here's the easiest way:

1. Forward this message to 3 clients who need CIPC compliance
2. Or post on your social media with your referral link
3. Use our email template (attached) for professional outreach

Remember: Every client you refer earns you R480+ per year in passive income.`
      },
      {
        day: 7,
        subject: "Partner Success Story + Marketing Materials",
        content: `Great news! One of our partners just earned R2,400 in their first week.

Here's how they did it:
• Sent our email template to their client list
• Posted on LinkedIn about the partnership
• Added the referral link to their email signature

Want the same results? Use our proven marketing materials: [LINK]`
      }
    ];

    if (partnerType === 'enterprise') {
      baseSequence.push({
        day: 14,
        subject: "White-Label Opportunity: Offer CIPC Services Under Your Brand",
        content: `As an Enterprise partner, you can now offer CIPC compliance services under your own brand.

Benefits:
• Your clients see your branding throughout
• Position yourself as a tech-forward firm
• Charge premium rates for "AI-powered" services
• Full API access for custom integrations

Ready to discuss? Book a call: [CALENDAR_LINK]`
      });
    }

    return { emails: baseSequence };
  }

  generateReferralTrackingEmail(partnerName: string, referralCount: number, commissionEarned: number): string {
    return `Subject: Your CIPC Agent Partnership Update - R${commissionEarned.toFixed(0)} Earned!

Hi ${partnerName},

Great news! Here's your partnership performance update:

📊 **This Month's Stats:**
• Total Referrals: ${referralCount}
• Commission Earned: R${commissionEarned.toFixed(0)}
• Average per Referral: R${referralCount > 0 ? (commissionEarned / referralCount).toFixed(0) : '0'}

🎯 **Growth Opportunity:**
You're ${Math.max(0, 10 - referralCount)} referrals away from our next commission tier (25% rate).

💡 **Quick Win Ideas:**
• Add your referral link to email signatures
• Share a LinkedIn post about AI automation
• Send our template to 5 more clients

Keep up the great work!

Best regards,
The CIPC Agent Team

View your full dashboard: https://cipcagent.co.za/partners/dashboard`;
  }
}

export default PartnerPitchService;