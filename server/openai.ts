// Integration with OpenAI for AI-powered content generation
// Reference: blueprint:javascript_openai
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface GeneratedContent {
  blogTitle: string;
  blogOutline: string;
  blogContent: string;
  newsletterFounders: string;
  newsletterCreatives: string;
  newsletterOperations: string;
}

export async function generateMarketingContent(topic: string): Promise<GeneratedContent> {
  // Use simulated content if OpenAI is not configured (for demo purposes)
  if (!openai) {
    console.log('OpenAI not configured, using simulated content generation');
    return generateSimulatedContent(topic);
  }

  try {
    // Generate blog post
    const blogResponse = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a professional content writer for NovaMind, an AI startup that helps creative agencies automate their workflows. 
        Generate engaging, informative blog posts about automation and AI for creative professionals.
        Output must be valid JSON with: blogTitle (string), blogOutline (string with bullet points), blogContent (string, 400-600 words).`,
      },
      {
        role: "user",
        content: `Write a blog post about: ${topic}. 
        Make it practical, engaging, and focused on how automation helps creative agencies.
        Format: { "blogTitle": "...", "blogOutline": "...", "blogContent": "..." }`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const blogData = JSON.parse(blogResponse.choices[0].message.content || "{}");

  // Generate three persona-specific newsletters
  const newsletterResponse = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a newsletter writer for NovaMind. Create three SHORT newsletter versions (150-200 words each) of a blog post, 
        each customized for a specific persona. Output must be valid JSON with: founders (string), creatives (string), operations (string).`,
      },
      {
        role: "user",
        content: `Blog Title: ${blogData.blogTitle}
        
Blog Summary: ${blogData.blogOutline}

Create three newsletter versions:
1. "founders": For Founders/Decision-Makers - Focus on ROI, business growth, efficiency gains, competitive advantage
2. "creatives": For Creative Professionals - Focus on inspiration, creative freedom, time-saving for passion projects
3. "operations": For Operations Managers - Focus on workflow optimization, team coordination, integration capabilities

Each should be 150-200 words, include a compelling subject line, and maintain NovaMind's voice.
Format: { "founders": "...", "creatives": "...", "operations": "..." }`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const newsletterData = JSON.parse(newsletterResponse.choices[0].message.content || "{}");

    return {
      blogTitle: blogData.blogTitle || "Untitled Blog Post",
      blogOutline: blogData.blogOutline || "",
      blogContent: blogData.blogContent || "",
      newsletterFounders: newsletterData.founders || "",
      newsletterCreatives: newsletterData.creatives || "",
      newsletterOperations: newsletterData.operations || "",
    };
  } catch (error: any) {
    // If OpenAI API fails (rate limit, quota, network error), fall back to simulation
    console.error('OpenAI API error, falling back to simulated content:', error.message);
    return generateSimulatedContent(topic);
  }
}

export async function generatePerformanceInsight(
  campaignTitle: string,
  performanceData: Array<{ persona: string; openRate: number; clickRate: number }>
): Promise<{ summary: string; recommendations: string; topPerformingPersona: string }> {
  const performanceSummary = performanceData
    .map((p) => `${p.persona}: ${p.openRate}% open, ${p.clickRate}% click`)
    .join("; ");

  const topPersona = performanceData.reduce((max, p) =>
    p.openRate > max.openRate ? p : max
  );

  // Use simulated insights if OpenAI is not configured
  const simulatedInsight = {
    summary: `Campaign "${campaignTitle}" showed varied engagement across personas. ${topPersona.persona} achieved the highest open rate at ${topPersona.openRate}%, while overall click-through rates averaged ${Math.round(performanceData.reduce((sum, p) => sum + p.clickRate, 0) / performanceData.length)}%.`,
    recommendations: `Consider A/B testing subject lines for lower-performing personas. Focus on ${topPersona.persona}'s interests in future content. Experiment with different send times to optimize engagement.`,
    topPerformingPersona: topPersona.persona,
  };

  if (!openai) {
    console.log('OpenAI not configured, using simulated insights');
    return simulatedInsight;
  }

  try {
    const insightResponse = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a marketing analytics expert. Analyze campaign performance and provide actionable insights.
        Output must be valid JSON with: summary (string), recommendations (string).`,
      },
      {
        role: "user",
        content: `Campaign: "${campaignTitle}"
        
Performance: ${performanceSummary}

Analyze this data and provide:
1. A brief summary (2-3 sentences) of what the data shows
2. Actionable recommendations (2-3 specific suggestions) for improving future campaigns

Format: { "summary": "...", "recommendations": "..." }`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 512,
  });

    const insightData = JSON.parse(insightResponse.choices[0].message.content || "{}");

    return {
      summary: insightData.summary || "Performance data analyzed.",
      recommendations: insightData.recommendations || "Continue testing different approaches.",
      topPerformingPersona: topPersona.persona,
    };
  } catch (error: any) {
    // If OpenAI API fails, fall back to simulation
    console.error('OpenAI API error for insights, falling back to simulated insights:', error.message);
    return simulatedInsight;
  }
}

// Simulated content generation for demo purposes when OpenAI API is not available
function generateSimulatedContent(topic: string): GeneratedContent {
  const blogTitle = `How ${topic} Transforms Creative Agency Workflows`;
  
  const blogOutline = `• Introduction to ${topic} in the creative industry
• Key benefits for agency efficiency
• Real-world implementation strategies
• Common challenges and solutions
• Future trends and recommendations`;

  const blogContent = `In today's fast-paced creative industry, ${topic} has emerged as a game-changing force for agencies looking to streamline their operations and deliver exceptional results.

The adoption of ${topic} represents more than just a technological upgrade—it's a fundamental shift in how creative teams approach their daily workflows. By automating repetitive tasks and providing intelligent insights, agencies can redirect their energy toward what truly matters: creativity and client relationships.

One of the most significant advantages of ${topic} is its ability to reduce time spent on administrative tasks. Creative professionals often find themselves bogged down by project management, client communications, and status updates. With the right automation tools, these tasks can be handled efficiently, freeing up valuable creative time.

Implementation doesn't have to be overwhelming. Start small by identifying your most time-consuming manual processes. Many agencies begin with automated client reporting or project tracking, gradually expanding to more complex workflows as team members become comfortable with the new systems.

The future of ${topic} in creative agencies looks promising. As artificial intelligence continues to evolve, we can expect even more sophisticated automation capabilities that anticipate needs and provide proactive solutions. Agencies that embrace these changes now will be well-positioned for future success.

The key is to view ${topic} not as a replacement for human creativity, but as a powerful enabler that allows creative teams to focus on what they do best—creating remarkable work that drives business results.`;

  const newsletterFounders = `Subject: How ${topic} Can Drive 30% Efficiency Gains for Your Agency

Dear Decision-Maker,

Time is money, and in the creative agency world, every minute counts toward your bottom line. We've seen firsthand how ${topic} can transform agency operations, delivering measurable ROI through increased efficiency and reduced overhead.

Our latest research shows that agencies implementing ${topic} see an average 30% reduction in administrative time, allowing teams to take on more projects without expanding headcount. This directly impacts profitability and competitive positioning.

The investment in ${topic} pays for itself through faster project turnaround, improved client satisfaction scores, and reduced operational costs. Leading agencies are already seeing these benefits—don't let your competition get ahead.

Ready to explore how ${topic} can transform your agency's performance metrics?

Best regards,
The NovaMind Team`;

  const newsletterCreatives = `Subject: Reclaim Your Creative Time with ${topic}

Hey Creative,

Imagine spending more time on actual creative work and less time on status updates, file management, and administrative tasks. That's the promise of ${topic}, and it's already changing how creative professionals work.

The best part? ${topic} doesn't replace your creativity—it amplifies it. By handling the tedious stuff automatically, you get more space for experimentation, iteration, and the kind of deep creative thinking that produces breakthrough work.

We've heard from designers, writers, and art directors who've reclaimed 10+ hours per week by automating their workflows. That's 10 more hours for passion projects, skill development, or simply delivering better work to clients.

Your creativity is too valuable to waste on repetitive tasks. Let ${topic} handle the busywork while you focus on creating work you're proud of.

Keep creating,
The NovaMind Team`;

  const newsletterOperations = `Subject: Streamline Your Agency Operations with ${topic}

Hello Operations Manager,

Managing multiple projects, coordinating team workflows, and ensuring everything runs smoothly is no small feat. ${topic} is designed to make your job easier by automating the coordination and tracking that currently eats up your day.

Here's what operations teams are achieving with ${topic}:
• Automated project status updates across all stakeholders
• Seamless integration with existing tools and platforms
• Real-time visibility into project health and resource allocation
• Reduced manual data entry and reporting time by 60%

The reliability you need is built in. ${topic} integrates with your current systems, ensuring smooth data flow without disrupting established workflows. Your team stays coordinated, projects stay on track, and you finally get the visibility you need.

Let's discuss how ${topic} can optimize your specific workflow challenges.

Regards,
The NovaMind Team`;

  return {
    blogTitle,
    blogOutline,
    blogContent,
    newsletterFounders,
    newsletterCreatives,
    newsletterOperations,
  };
}
