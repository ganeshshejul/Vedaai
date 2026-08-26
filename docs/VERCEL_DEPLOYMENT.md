# Vercel Deployment Plan

VedaAI is built inside a Turborepo monorepo with Next.js applications. Deploying it to Vercel requires specific configuration to handle the monorepo structure and ensure the environment variables are correctly injected.

## 1. Prerequisites
- A GitHub repository containing the VedaAI codebase.
- A Vercel account linked to your GitHub.
- A valid Google Gemini API Key (`GEMINI_API_KEY`).

## 2. Vercel Project Setup
1. Log into your Vercel dashboard and click **Add New... > Project**.
2. Import the `Vedaai` GitHub repository.
3. **Framework Preset:** Vercel should automatically detect `Next.js`.
4. **Root Directory:** You MUST set the Root Directory to `apps/web`. Vercel needs to know which application inside the Turborepo to deploy.

## 3. Build & Output Settings
Expand the **Build and Output Settings**. Since this is a Turborepo, you need to override the default Next.js build command to run through Turbo.
- **Build Command:** `cd ../.. && npx turbo run build --filter=web`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## 4. Environment Variables
Expand the **Environment Variables** section and add the required API keys.
- **Key:** `GEMINI_API_KEY`
- **Value:** `[Your actual API key]`
*(Ensure this is added to the Production, Preview, and Development environments).*

## 5. Deploy
Click **Deploy**. Vercel will:
1. Clone the repository.
2. Navigate to the monorepo root and install dependencies across all workspaces (`packages/types`, `apps/web`).
3. Run the Turborepo build pipeline specifically for the `web` filter.
4. Host the output on a global edge network.

## Troubleshooting 504 / Function Timeouts
Because PDF compression and LLM analysis can take between 10-30 seconds, the `/api/process` route may exceed the default Vercel Hobby plan timeout (10 seconds).
- **Solution 1:** Upgrade to a Vercel Pro plan (which increases the timeout limit to 15-300 seconds).
- **Solution 2:** In `apps/web/next.config.ts`, you can attempt to configure the `maxDuration` property for the API route.
```typescript
// next.config.ts
export default {
  // Config specific to edge/serverless boundaries
};
```
- **Solution 3:** Migrate the heavy `/api/process` processing to a Vercel Background Function or standard Google Cloud Run instance if extreme PDF files consistently exceed network timeouts.
