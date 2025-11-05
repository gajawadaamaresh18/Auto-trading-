# GitHub Secrets Setup Guide

This guide explains how to set up GitHub secrets for the CI/CD pipeline.

## Required Secrets

### 1. Expo Token (`EXPO_TOKEN`)

**Your Expo Token:**
```
kiPFrISvNWgOfyWP3HU75ZT4oLOgT_JFXkzud45W
```

**How to add it to GitHub:**

1. Go to your repository: `https://github.com/gajawadaamaresh18/Auto-trading-`
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. **Name:** `EXPO_TOKEN`
6. **Secret:** `kiPFrISvNWgOfyWP3HU75ZT4oLOgT_JFXkzud45W`
7. Click **Add secret**

**To get a new Expo token (if needed):**
1. Go to https://expo.dev/
2. Sign in to your account
3. Go to **Account Settings** → **Access Tokens**
4. Click **Create Token**
5. Give it a name (e.g., "CI/CD Pipeline")
6. Copy the token and add it as a GitHub secret

---

### 2. Docker Hub Credentials

#### Docker Username (`DOCKER_USERNAME`)

**How to get Docker Username:**
1. Go to https://hub.docker.com/
2. Sign up or sign in to your account
3. Your username is shown in the top right corner or in your profile URL
   - Example: If your profile is `https://hub.docker.com/u/yourusername`, then `yourusername` is your Docker username

#### Docker Password (`DOCKER_PASSWORD`)

**How to get Docker Password:**
1. Go to https://hub.docker.com/
2. Sign in to your account
3. Click on your username (top right) → **Account Settings**
4. Click **Security** in the left sidebar
5. Click **New Access Token**
6. Give it a name (e.g., "GitHub Actions CI/CD")
7. Set permissions to **Read & Write** (or **Read, Write & Delete** if you want full access)
8. Click **Generate**
9. **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
10. This token is your `DOCKER_PASSWORD` (not your regular Docker Hub password)

**How to add Docker credentials to GitHub:**

1. Go to your repository: `https://github.com/gajawadaamaresh18/Auto-trading-`
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

   **For Docker Username:**
   - **Name:** `DOCKER_USERNAME`
   - **Secret:** Your Docker Hub username (e.g., `yourusername`)
   - Click **Add secret**

   **For Docker Password:**
   - **Name:** `DOCKER_PASSWORD`
   - **Secret:** The access token you generated (not your regular password!)
   - Click **Add secret**

---

## Optional Secrets (Currently Disabled)

### Slack Webhook (`SLACK_WEBHOOK`)

Currently disabled. To enable Slack notifications:

1. Create a Slack webhook URL in your Slack workspace
2. Add it as a GitHub secret named `SLACK_WEBHOOK`
3. Uncomment the notification job in `.github/workflows/ci-cd.yml`

---

## Verification

After adding secrets:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see:
   - ✅ `EXPO_TOKEN`
   - ✅ `DOCKER_USERNAME`
   - ✅ `DOCKER_PASSWORD`

The workflow will automatically use these secrets when running.

---

## Security Notes

- ⚠️ **Never commit secrets to your repository**
- ⚠️ **Never share your access tokens publicly**
- ✅ Secrets are encrypted and only accessible to GitHub Actions
- ✅ Secrets are masked in workflow logs (they won't appear in output)

