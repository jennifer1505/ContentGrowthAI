# NovaMind - AI Marketing Content Pipeline

## Project Overview
An AI-powered marketing content pipeline that automates blog post and newsletter generation, distribution via HubSpot CRM, and performance analytics. Built for the NovaMind take-home assignment for the Content & Growth Analyst Intern position.

## Purpose
This application demonstrates the ability to:
- Generate AI-powered marketing content using OpenAI GPT-5
- Manage CRM contacts and distribute personalized newsletters via HubSpot
- Track and analyze campaign performance metrics
- Provide AI-driven insights and recommendations

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side navigation
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn UI component library
- **State Management**: TanStack Query (React Query v5)
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express
- **AI Integration**: OpenAI GPT-5 for content generation
- **CRM Integration**: HubSpot API for contact management and distribution
- **Storage**: In-memory storage (MemStorage) for rapid prototyping
- **Validation**: Zod schemas shared between frontend and backend

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Shadcn UI primitives
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/           # Application pages
│   │   │   ├── dashboard.tsx    # Main dashboard with metrics
│   │   │   ├── generate.tsx     # Content generation interface
│   │   │   ├── campaigns.tsx    # Campaign history
│   │   │   └── analytics.tsx    # Performance analytics
│   │   ├── lib/             # Utilities and client setup
│   │   ├── App.tsx          # Main app with navigation
│   │   └── index.css        # Global styles and design tokens
├── server/
│   ├── routes.ts            # API endpoint definitions
│   ├── storage.ts           # Data storage interface
│   ├── openai.ts            # OpenAI integration
│   └── hubspot.ts           # HubSpot CRM integration
├── shared/
│   └── schema.ts            # Shared TypeScript types and Zod schemas
└── design_guidelines.md     # Visual design specifications
```

## Key Features

### 1. AI Content Generation
- Input a marketing topic and generate:
  - Blog post (400-600 words) with outline
  - Three personalized newsletter versions for different personas:
    - **Founders/Decision-Makers**: Focus on ROI, growth, efficiency
    - **Creative Professionals**: Focus on inspiration, time-saving tools
    - **Operations Managers**: Focus on workflows, integrations, reliability
- Powered by OpenAI GPT-5 for high-quality, contextual content

### 2. HubSpot CRM Integration
- Create and manage contacts with persona-based segmentation
- Distribute personalized newsletters to targeted audience segments
- Tag contacts by persona type for accurate targeting
- Campaign logging with metadata (title, send date, personas)

### 3. Performance Analytics
- Track key metrics per campaign and persona:
  - Open rates
  - Click-through rates
  - Unsubscribe rates
  - Recipient counts
- Visualize performance comparisons across personas
- Historical trend analysis

### 4. AI-Powered Insights
- Automatic performance summary generation
- Actionable recommendations based on engagement data
- Identification of top-performing personas
- Data-driven content optimization suggestions

### 5. Beautiful Dashboard
- Real-time metrics overview (total campaigns, avg open rate, top persona)
- Recent campaign activity timeline
- Responsive design with dark/light mode support
- Professional, modern SaaS interface

## Data Model

### Campaigns
- Stores generated content (blog + 3 newsletters)
- Tracks creation date and distribution status
- Links to performance metrics and AI insights

### Performance
- Per-persona engagement metrics for each campaign
- Tracks recipient count and conversion rates
- Used for analytics and AI-powered recommendations

### Insights
- AI-generated summaries and recommendations
- Links campaign performance to actionable next steps
- Identifies best-performing audience segments

## User Workflows

### Primary Workflow: Content Generation → Distribution → Analysis
1. **Navigate to Generate page**
2. **Enter a marketing topic** (e.g., "AI in creative automation")
3. **Click "Generate Content"** - AI creates blog + 3 newsletters
4. **Review generated content** in preview cards
5. **Click "Distribute Campaign"** - Sends to HubSpot CRM
6. **View results** in Dashboard, Campaigns, or Analytics pages
7. **Read AI insights** for optimization recommendations

### Secondary Workflows
- **Dashboard**: Quick overview of all campaign metrics
- **Campaigns**: Browse history, view past content, check performance
- **Analytics**: Deep dive into persona-specific engagement patterns

## Environment Variables
- `OPENAI_API_KEY`: Required for AI content generation

## Design System
- **Primary Color**: Purple (#7C3AED) - Used for CTAs and active states
- **Success**: Green - Performance indicators
- **Warning**: Amber - Moderate engagement
- **Danger**: Red - Low performance or errors
- **Typography**: Inter (primary), JetBrains Mono (code/data)
- **Dark Mode First**: Optimized for professional B2B aesthetic
- **Spacing**: Consistent 4px grid system
- **Components**: Shadcn UI with custom theming

## Recent Changes
- **October 20, 2025**: Initial project setup
  - Complete schema definition with campaigns, performance, and insights
  - All frontend pages built (Dashboard, Generate, Campaigns, Analytics)
  - Navigation and theme system implemented
  - Design tokens configured in Tailwind and index.css

## Architecture Decisions

### Why In-Memory Storage?
For this take-home assignment, in-memory storage allows rapid iteration and testing without database setup complexity. Production would use PostgreSQL via the existing Drizzle schema.

### Why Schema-First Development?
Defining TypeScript types and Zod schemas upfront ensures:
- Type safety across frontend and backend
- Consistent validation rules
- Easier refactoring and maintenance
- Clear API contracts

### Why Horizontal Layer Development?
Building all frontend components together ensures:
- Consistent design system application
- Reusable component patterns
- Better UX coherence
- Efficient parallel development

## Testing Notes
- Test content generation with various topics
- Verify persona-specific newsletter customization
- Check HubSpot contact creation and segmentation
- Validate performance metric calculations
- Ensure responsive design on mobile/tablet/desktop
- Test dark/light mode transitions

## Future Enhancements (Beyond MVP)
- A/B testing framework for headlines and content variations
- Content revision system with approval workflows
- Scheduled automated content generation
- Advanced analytics with trend predictions
- Integration with additional CRM platforms
- Persistent database storage for production use
