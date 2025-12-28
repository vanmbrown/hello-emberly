# Deployment Guide

## Vercel Configuration

### Initial Setup

1. **Connect Repository**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import repository: `vanmbrown/hello-emberly`
   - Framework Preset: Next.js (auto-detected)

2. **Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add variable:
     - **Name**: `NEXT_PUBLIC_API_BASE_URL`
     - **Value**: `https://api.helloemberly.com`
     - **Environment**: Production, Preview, Development (select all)

3. **Build Settings**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Deploy**
   - Click "Deploy" to trigger first deployment
   - Verify build passes
   - Test production URL

### Subsequent Deployments

- Automatic deployments trigger on push to `main` branch
- Preview deployments trigger on pull requests
- Manual deployments can be triggered from Vercel dashboard

## GitHub Branch Protection

### Setup Steps

1. Go to: https://github.com/vanmbrown/hello-emberly/settings/branches

2. Click "Add rule" or edit existing rule for `main` branch

3. Configure protection rules:
   - ✅ **Require a pull request before merging**
     - Required number of approvals: 1 (or as needed)
     - Dismiss stale pull request approvals when new commits are pushed: ✅
   - ✅ **Require status checks to pass before merging**
     - Require branches to be up to date before merging: ✅
     - Status checks to require: (add checks as needed)
   - ✅ **Do not allow bypassing the above settings**
   - ✅ **Restrict who can push to matching branches**: (optional, restrict to specific users/teams)

4. Save changes

### Required Status Checks

Once CI/CD is set up, add these checks:
- `npm run lint`
- `npm run test:e2e` (if configured)
- Vercel deployment preview (if configured)

## Manual Deployment Commands

If Vercel CLI is installed:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod
```

