import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Sentry (optional)
  sentryDsn: process.env.SENTRY_DSN || null,

  // Dashboard password (optional - if not set, dashboard is open)
  dashboardPassword: process.env.DASHBOARD_PASSWORD || null,

  // HeyReach API
  heyreachApiKey: process.env.HEYREACH_API_KEY,
  heyreachBaseUrl: 'https://api.heyreach.io',

  // Claude API (Anthropic) - for local training
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  claudeModel: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',

  // OpenAI API - for web agent
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiVectorStoreId: process.env.OPENAI_VECTOR_STORE_ID || 'vs_69612dae3ac481919df01a62fb27b603',
  openaiPrimaryModel: process.env.OPENAI_PRIMARY_MODEL || 'gpt-5-mini',
  openaiReviewModel: process.env.OPENAI_REVIEW_MODEL || 'gpt-5',

  // Auto-approval settings
  autoApproveConfidence: parseFloat(process.env.AUTO_APPROVE_CONFIDENCE || '0.85'),
  sendEnabled: process.env.SEND_ENABLED === 'true',

  // Processing limits
  fetchLimit: parseInt(process.env.FETCH_LIMIT || '25'),
  maxMessagesPerRun: parseInt(process.env.MAX_MESSAGES_PER_RUN || '30'),

  // LinkedIn Account IDs (from your config)
  linkedInAccountIds: [
    93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837,
    94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125,
    118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189
  ],

  // Campaign IDs (from your config - IN_PROGRESS campaigns)
  campaignIds: [223998, 240191, 274509, 181549, 180990, 180988],

  // Product links (synced with config.md)
  links: {
    cazvidJobPostingEs: 'https://share.cazvid.app/i/link/67cc2d42-9bcd-4632-87d9-fb3a5f43deac',
    cazvidJobPostingEn: 'https://share.cazvid.app/i/link/be54bb1c-c720-4330-9aeb-ddcdf4c37d84',
    cazvidTutorialEs: 'https://youtu.be/c0E8sfSFqeM',
    cazvidTutorialEn: 'https://youtu.be/mldU26l91ZA',
    agencyLeadsCalendly: 'https://calendly.com/agency-leads/agency-leads-premium-staffing-leads-c0100'
  },

  // Pricing truth
  pricing: {
    free: ['Posting jobs', 'Browsing candidates', 'Viewing profiles', 'Receiving applications'],
    paid: '$50/month - Contacting candidates, sending direct messages, accessing contact info'
  }
};

// Validate required config
if (!config.heyreachApiKey) {
  console.error('Missing required config: HEYREACH_API_KEY');
  process.exit(1);
}

// Require at least one AI provider
if (!config.openaiApiKey && !config.anthropicApiKey) {
  console.error('Missing AI provider: Set either OPENAI_API_KEY or ANTHROPIC_API_KEY');
  process.exit(1);
}

// Warn if OpenAI is configured but Vector Store is not
if (config.openaiApiKey && !process.env.OPENAI_VECTOR_STORE_ID) {
  console.warn('Warning: OPENAI_VECTOR_STORE_ID not set, using default');
}
