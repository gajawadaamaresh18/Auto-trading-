# EAS Build Troubleshooting Guide

If you're not seeing builds in Expo, follow these steps:

## 🔍 Check Build Status

### 1. Check Workflow Logs
1. Go to: https://github.com/gajawadaamaresh18/Auto-trading-/actions
2. Open the latest workflow run
3. Click on "Android AAB (EAS Cloud)" job
4. Check the "Trigger EAS Android production build" step
5. Look for:
   - Build ID output
   - Error messages
   - Build submission status

### 2. Check Expo Dashboard
1. Go to: https://expo.dev/
2. Sign in to your account
3. Navigate to: **Builds** → **All Builds**
4. Filter by **Android** platform
5. Check if any builds are listed (even failed ones)

### 3. Verify Expo Token
1. Go to: https://expo.dev/accounts/[your-account]/settings/access-tokens
2. Verify your token exists and is active
3. Check if the token has the correct permissions:
   - ✅ Build access
   - ✅ Account access

### 4. Check Project Configuration
1. Verify `frontend/app.json` has:
   - `name`: "Auto Trading"
   - `slug`: "auto-trading"
   - `android.package`: "com.autotrading.marketplace"

2. Verify `frontend/.eas.json` has:
   - `build.production.android.buildType`: "app-bundle"

## 🛠️ Common Issues and Solutions

### Issue 1: Build Not Starting
**Symptoms:**
- Workflow shows success but no build in Expo
- No build ID in workflow logs

**Solutions:**
1. Check if EAS build command is actually running
2. Verify Expo token is valid: `npx eas whoami`
3. Check if project is linked: `npx eas project:info`
4. Review workflow logs for authentication errors

### Issue 2: Build Failed Silently
**Symptoms:**
- Build appears in Expo but shows as failed
- No error messages visible

**Solutions:**
1. Check build logs in Expo dashboard
2. Review build configuration in `.eas.json`
3. Check for missing dependencies or configuration
4. Verify `app.json` is valid JSON

### Issue 3: Build ID Not Extracted
**Symptoms:**
- "Wait for EAS build" step is skipped
- No build ID in workflow output

**Solutions:**
1. Check if build output JSON is valid
2. Verify `jq` is available in workflow
3. Review build output JSON structure
4. Check if build was actually submitted

### Issue 4: Wrong Expo Account
**Symptoms:**
- Builds appear in different account
- Token doesn't match account

**Solutions:**
1. Verify which Expo account the token belongs to
2. Check account ownership in Expo dashboard
3. Create new token if needed
4. Update `EXPO_TOKEN` secret in GitHub

## 🔧 Manual Build Test

Test the build manually to verify configuration:

```bash
cd frontend
npx eas login
npx eas build:configure
npx eas build -p android --profile production
```

If this works, the issue is with the CI/CD workflow. If it fails, the issue is with your Expo configuration.

## 📋 Check Workflow Artifacts

1. Go to the workflow run in GitHub Actions
2. Scroll to "Artifacts" section
3. Download `eas-android-build-info`
4. Open `eas-build-output.json` and `eas-latest.json`
5. Check for:
   - Build ID
   - Build status
   - Error messages
   - Build URL

## 🚀 Force a New Build

To trigger a new build and see detailed output:

1. Make a small change to trigger the workflow
2. Or manually trigger the workflow:
   - Go to Actions tab
   - Click "Auto Trading App CI/CD"
   - Click "Run workflow"
   - Select branch: `main`
   - Click "Run workflow"

## 📞 Get Help

If none of the above works:

1. **Check Expo Status**: https://status.expo.dev/
2. **Expo Documentation**: https://docs.expo.dev/build/introduction/
3. **EAS CLI Help**: `npx eas build --help`
4. **GitHub Issues**: Check workflow logs for specific errors

## ✅ Verification Checklist

- [ ] Expo token is valid and active
- [ ] Project is linked to Expo account
- [ ] `app.json` is valid and complete
- [ ] `.eas.json` is configured correctly
- [ ] Workflow logs show build submission
- [ ] Build appears in Expo dashboard
- [ ] Build artifacts are downloaded

---

**Next Steps:**
1. Check the latest workflow run logs
2. Verify your Expo account for builds
3. Review the troubleshooting steps above
4. Try a manual build test

