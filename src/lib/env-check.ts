export function checkEnvironmentVariables() {
  return {
    clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    ai: !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
    allConfigured: !!(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
    )
  };
}

export function getSetupInstructions() {
  return [
    {
      title: "Clerk Authentication",
      description: "Set up Clerk for user authentication",
      service: "clerk",
      envVars: [
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        "CLERK_SECRET_KEY"
      ],
      steps: [
        "Create a Clerk account at clerk.com",
        "Create a new application",
        "Copy the Publishable and Secret keys",
        "Add keys to your environment variables"
      ],
      url: "https://clerk.com/docs"
    },
    {
      title: "Supabase Database",
      description: "Configure Supabase for database",
      service: "supabase",
      envVars: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      ],
      steps: [
        "Create a Supabase account at supabase.com",
        "Create a new project",
        "Go to Settings > API to get your keys",
        "Add keys to your environment variables"
      ],
      url: "https://supabase.com/docs"
    },
    {
      title: "AI Integration",
      description: "Add AI capabilities with OpenAI or Anthropic",
      service: "ai",
      envVars: [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY"
      ],
      steps: [
        "Get API key from OpenAI or Anthropic",
        "Add the API key to your environment variables",
        "Choose your preferred AI provider"
      ],
      url: "https://sdk.vercel.ai/docs"
    }
  ];
}

export function getServiceStatus(service: string) {
  const envStatus = checkEnvironmentVariables();
  switch (service) {
    case 'clerk':
      return envStatus.clerk;
    case 'supabase':
      return envStatus.supabase;
    case 'ai':
      return envStatus.ai;
    default:
      return false;
  }
}