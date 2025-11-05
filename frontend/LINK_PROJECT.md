# Linking Your Expo Project

## Current Status
The project is **not currently linked** to your Expo account.

## Quick Link (Interactive - Recommended)

1. **Login to Expo:**
   ```powershell
   cd frontend
   $env:EXPO_TOKEN = "kiPFrISvNWgOfyWP3HU75ZT4oLOgT_JFXkzud45W"
   npx eas login
   ```
   Or use: `npx eas login --token kiPFrISvNWgOfyWP3HU75ZT4oLOgT_JFXkzud45W`

2. **Initialize/Link Project:**
   ```powershell
   npx eas project:init
   ```
   When prompted:
   - Choose "Create a new project"
   - Project will be created as: `@gajawadaamaresh18/auto-trading`

3. **Verify:**
   ```powershell
   npx eas project:info
   ```

## CI/CD Note
The GitHub Actions workflow will automatically create the project when it runs `eas build` if the project doesn't exist. However, for the best experience, it's recommended to link the project first.

## Manual Project Creation (Alternative)

If you prefer to create the project via the Expo dashboard:

1. Go to: https://expo.dev/accounts/gajawadaamaresh18/projects
2. Click "Create Project"
3. Enter:
   - **Name**: Auto Trading
   - **Slug**: auto-trading
4. After creation, link it locally:
   ```powershell
   npx eas project:init --id <project-id-from-dashboard>
   ```

## Verification
After linking, verify with:
```powershell
$env:EXPO_TOKEN = "kiPFrISvNWgOfyWP3HU75ZT4oLOgT_JFXkzud45W"
npx eas project:info
```

You should see project details including:
- Project ID
- Account name
- Project slug

