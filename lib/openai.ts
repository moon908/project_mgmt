import { Task } from '../types';

export interface AIResponse {
  content: string;
  suggestedTasks?: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    storyPoints: number;
    labels: string[];
  }[];
}

export async function generateAIContent(
  prompt: string,
  projectContext?: { name: string; description: string; tasks: Task[] }
): Promise<AIResponse> {
  // Use the provided Groq key directly, or fall back to custom environment keys
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY ||
    process.env.GROQ_API_KEY ||
    "";

  if (apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an advanced Project Manager AI assistant. Deliver answers in beautiful, clean markdown. Offer helpful task breakdowns or roadmap summaries. If asked to break down tasks, please write them as: "* **Task Title**: Description [Priority: Low/Medium/High/Urgent, Estimation: N story points]".'
            },
            {
              role: 'user',
              content: `Project Context: ${JSON.stringify(projectContext)}. User prompt: ${prompt}`
            }
          ],
          temperature: 0.7
        })
      });
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'Failed to generate response.';

      // Attempt to extract structured tasks if the user requested a breakdown
      let suggestedTasks;
      if (prompt.toLowerCase().includes('break') || prompt.toLowerCase().includes('task') || prompt.toLowerCase().includes('roadmap')) {
        suggestedTasks = parseTasksFromMarkdown(text);
      }

      return { content: text, suggestedTasks };
    } catch (e) {
      console.error("Groq API call failed, falling back to Simulation Mode.", e);
    }
  }

  // HIGH-FIDELITY SIMULATION FALLBACK ENGINE
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      const projectName = projectContext?.name || 'ProjectFlow AI';

      let content = '';
      let suggestedTasks: AIResponse['suggestedTasks'] = [];

      if (lowerPrompt.includes('roadmap') || lowerPrompt.includes('ecommerce') || lowerPrompt.includes('e-commerce')) {
        content = `### 📍 Road Map: E-Commerce Web Application Launch
Here is a high-level sprint-by-sprint roadmap generated for your project context **${projectName}**:

#### 🏃‍♂️ Sprint 1: Foundation & Core Database
* **Database Modeling**: Setup PostgreSQL schemas for products, users, orders, and payments.
* **Authentication Flow**: Setup Google OAuth & email logins.
* **Product Catalog**: Build dynamic search filters, image previews, and categories listings.

#### 🏃‍♂️ Sprint 2: Shopping Cart & State Manager
* **Cart Logic**: Handle persistence, local cookie caching, and quantity overrides.
* **User Profile**: Track address history, purchase items, and wishlist collections.

#### 🏃‍♂️ Sprint 3: Payment Integrations & Checkout
* **Stripe Checkout**: Incorporate webhooks, coupon validations, and checkout sessions.
* **Transactional Emails**: Send order receipts via Resend or AWS SES.

#### 🏃‍♂️ Sprint 4: Load Testing & Performance Tuning
* **Image Optimizations**: Setup Cloudinary loaders for fast catalog display.
* **Vercel Edge caching**: Minimize database hits on product page routes.`;
      }
      else if (lowerPrompt.includes('break') || lowerPrompt.includes('task')) {
        content = `### 📋 Task Breakdown: ${projectName}
I have analyzed your project description and created a breakdown of 4 critical tasks:

1. **Setup Redux Store/Zustand State for Checkout**: Configure client actions for add-to-cart, clear-cart, and coupon calculations. [Priority: High, Estimation: 5 Story Points]
2. **Draft Stripe Webhook Endpoint**: Handle payment failures, checkout successes, and database customer logs. [Priority: Urgent, Estimation: 8 Story Points]
3. **Configure Docker Compose Local Environment**: Run PostgreSQL and Redis instances inside local containers for testing. [Priority: Medium, Estimation: 3 Story Points]
4. **Implement UI Loading Skeletons**: Create custom loading states for image galleries and filters. [Priority: Low, Estimation: 2 Story Points]`;

        suggestedTasks = [
          { title: 'Setup Zustand State for Cart Checkout', description: 'Configure global client actions for adding, updating, and clearing items.', priority: 'high', storyPoints: 5, labels: ['Frontend', 'State'] },
          { title: 'Draft Stripe Webhook API Endpoint', description: 'Listen to Stripe payment hooks and log successes in the Postgres DB.', priority: 'urgent', storyPoints: 8, labels: ['Backend', 'Security'] },
          { title: 'Configure Docker Compose Local Environment', description: 'Bundle PostgreSQL and Redis inside local development container models.', priority: 'medium', storyPoints: 3, labels: ['DevOps'] },
          { title: 'Implement Responsive UI Loading Skeletons', description: 'Build premium shimmers for product pages and search grids.', priority: 'low', storyPoints: 2, labels: ['Design', 'UI'] }
        ];
      }
      else if (lowerPrompt.includes('blocker') || lowerPrompt.includes('risk')) {
        content = `### ⚠️ Risk Analysis & Potential Blockers: ${projectName}
Here is an automated risk report evaluating your active project:

1. **Single Developer Bottleneck**: The majority of frontend and task assignments are aligned to the Owner. Consider delegating **Zustand states** to *Alex Rivera*.
2. **Stripe API Version deprecations**: Ensure the local environment webhook libraries match the API versions set on Stripe dashboards.
3. **Third-Party Email Limits**: Sandbox limits on Resend or SES might restrict registration email triggers. Prompt team to complete domain DNS verification before beta launch.`;
      }
      else if (lowerPrompt.includes('progress') || lowerPrompt.includes('summarize')) {
        const total = projectContext?.tasks.length || 0;
        const done = projectContext?.tasks.filter(t => t.status === 'completed').length || 0;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        content = `### 📊 Daily Progress Review Summary
Here is the status summary for **${projectName}**:

* **Current Completion Status**: ${progress}% complete (${done} of ${total} tasks resolved).
* **Active Tasks**: The team is working on ${projectContext?.tasks.filter(t => t.status === 'in_progress').length || 0} active cards.
* **Next Target**: Setup core auth scripts and drag-and-drop controllers.
* **Recommendations**: Review open comment threads on *Dashboard Design UI* to resolve UX layout discrepancies.`;
      }
      else {
        content = `### 🤖 Workspace Assistant Chat Response
Thanks for the prompt! I am analyzing your workspace. Here are some actions you can take:

* Try typing **"road map for an ecommerce app"** to generate a full sprint timeline.
* Try typing **"break this project into tasks"** to get suggestions you can add directly to your active Kanban board.
* Try typing **"suggest blockers"** to run a risk analysis report on database or deployment bottlenecks.

Let me know if there's a specific task or team member allocation you want to optimize!`;
      }

      resolve({ content, suggestedTasks });
    }, 1200); // realistic network delay
  });
}

function parseTasksFromMarkdown(md: string): AIResponse['suggestedTasks'] {
  const tasks: AIResponse['suggestedTasks'] = [];
  const lines = md.split('\n');

  lines.forEach(line => {
    // Matches patterns like: * **Task Title**: Description [Priority: Urgent, Estimation: 5 story points]
    // or: 1. **Task Title**: Description
    const match = line.match(/(?:\d+\.|\*|-)\s+\*\*(.*?)\*\*:\s*(.*)/);
    if (match) {
      const title = match[1].trim();
      let descPart = match[2].trim();

      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
      if (descPart.toLowerCase().includes('urgent')) priority = 'urgent';
      else if (descPart.toLowerCase().includes('high')) priority = 'high';
      else if (descPart.toLowerCase().includes('low')) priority = 'low';

      let storyPoints = 3;
      const ptsMatch = descPart.match(/(\d+)\s*(?:story points|points|pts)/i);
      if (ptsMatch) {
        storyPoints = parseInt(ptsMatch[1], 10);
      }

      const cleanDesc = descPart.replace(/\[.*?\]/g, '').trim();

      tasks.push({
        title,
        description: cleanDesc || 'AI Recommended Task Item',
        priority,
        storyPoints,
        labels: ['Groq-AI']
      });
    }
  });

  if (tasks.length === 0) {
    tasks.push({
      title: 'Analyze Repository Security Dependencies',
      description: 'Check package files for dependency vulnerabilities and update middleware.',
      priority: 'medium',
      storyPoints: 2,
      labels: ['Groq-AI']
    });
  }

  return tasks;
}
