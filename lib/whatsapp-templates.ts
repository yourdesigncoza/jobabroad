import type { CategoryId } from './categories';
import { PAYSHAP } from './payshap';

export const MESSAGE_1_UNIVERSAL = `Hi 👋 Thanks for reaching out.

Before I point you anywhere — what work do you do and how many years' experience do you have?

I just want to make sure there's a realistic route before you pay for anything.`;

export const MESSAGE_2: Record<CategoryId, string> = {
  healthcare: `Thanks — healthcare is one of the strongest fields for South Africans looking to work abroad right now.

The Jobabroad Playbook covers:
• Realistic countries for your role
• Documents and visa route to check
• Likely costs before you apply
• Scam red flags to avoid
• Official government and programme links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  'it-tech': `Thanks — IT is one of the most portable fields and SA developers are in demand in several countries right now.

The Jobabroad Playbook covers:
• Realistic countries for your role
• Documents and visa route to check
• Likely costs before you apply
• Scam red flags to avoid
• Official government and programme links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  engineering: `Thanks — SA engineers are well-regarded internationally. Australia, Germany and the UK all have active programmes, but the credential recognition process is more involved than most agents will tell you.

The Jobabroad Playbook covers:
• Realistic countries for your discipline
• Documents and visa route to check
• Likely costs before you apply
• Scam red flags to avoid
• Official government and programme links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  teaching: `Thanks — teaching is one of the more accessible fields for SA professionals. The UK, UAE and Australia all have ongoing demand, but routes vary a lot by subject and qualification. Some have registration steps most people only find out about after paying the wrong person.

The Jobabroad Playbook covers:
• Realistic countries for SA teachers
• Documents and visa route to check
• Likely costs before you apply
• Scam red flags to avoid
• Official government and programme links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  accounting: `Thanks — SA accountants and finance professionals are in steady demand abroad, particularly in the UK, Australia and Ireland. Most countries require professional body recognition (SAICA → ICAEW, CA(SA) → CPA Australia, etc.) and the process is more involved than recruiters tend to admit.

The Jobabroad Playbook covers:
• Realistic countries for SA accountants
• Documents and qualification recognition route to check
• Likely costs before you apply
• Scam red flags to avoid
• Official government and professional body links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  farming: `Thanks — seasonal farm work is one of the more accessible routes for South Africans. The UK and Australia both run structured programmes with legal work visas. One thing to know upfront: the UK Seasonal Worker Visa does NOT require an upfront fee paid to any agent — if someone is asking for one, it's a scam.

The Jobabroad Playbook covers:
• Which programmes are open to SA applicants
• Documents and visa route to check
• Likely costs before you go
• Scam red flags to avoid
• Official programme pages and application links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  seasonal: `Thanks — the J1 visa is a legitimate route for young South Africans to work in the US. Carnival work, summer camps, amusement parks. There are specific eligibility requirements and a set application window — and fake J1 agents are active in this space.

The Jobabroad Playbook covers:
• Whether you qualify for the J1 route
• Documents and programme steps to check
• Likely costs before you go
• Scam red flags to avoid
• Official programme pages and application links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  hospitality: `Thanks — hospitality has year-round demand in the UAE, UK and Australia. The catch: it's also one of the spaces where fake job offers are most common. Knowing which routes are real before paying anyone is the most important first step.

The Jobabroad Playbook covers:
• Realistic countries for hospitality workers
• Documents and visa route to check
• Likely costs before you apply
• Scam red flags to avoid
• Official government and programme links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  trades: `Thanks — trades are in high demand abroad, especially in the UK and Australia. Red Seal recognition and trade test equivalency are key — and this is exactly where most agents mislead people.

The Jobabroad Playbook covers:
• Realistic countries for your trade
• Trade qualification recognition steps and documents
• Likely costs before you apply
• Scam red flags to avoid
• Official government and programme links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,

  other: `Thanks — your field is worth looking into.

The Jobabroad Playbook covers:
• Realistic countries for your role
• Documents and visa route to check
• Likely costs before you apply
• Scam red flags to avoid
• Official government and programme links

Includes a CV template and WhatsApp feedback.

R199 once-off. Ready to see the actual routes and costs? I'll send the PayShap details.`,
};

export function getMessage3(categoryLabel: string): string {
  return `${PAYSHAP.amount} to PayShap proxy: ${PAYSHAP.proxy}
Receiver: ${PAYSHAP.name}
Reference: [Your first and last name] — ${categoryLabel}

Send a screenshot once paid and I'll send your Playbook + access link straight away.

After payment, I'll send the guide and next-step instructions here on WhatsApp.`;
}
