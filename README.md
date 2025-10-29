# Construction Project Manager with GitHub Sync

A construction project management web application with GitHub data synchronization and offline support.

## Features

- **Project Management**: Add, edit, delete construction projects  
- **Team Management**: Manage architects, supervisors, and contractors
- **GitHub Sync**: Automatic data synchronization with GitHub repository
- **Offline Support**: Works offline with localStorage backup
- **Cross-Device**: Data syncs across devices and browser sessions
- **Real-time Status**: Visual sync status indicator

## Setup Instructions

### 1. GitHub Token Configuration (2025 Fine-grained Personal Access Token)

To enable GitHub synchronization, you need to create a Fine-grained Personal Access Token with specific permissions:

#### Step-by-Step Token Creation:

1. Go to **GitHub Settings** > **Developer Settings** > **Personal Access Tokens** > **Fine-grained tokens**
2. Click **"Generate new token"**
3. Fill in the token details:
   - **Token name**: Construction App Token (or any descriptive name)
   - **Expiration**: Set your preferred expiration (90 days recommended)
   - **Resource owner**: Select your account or organization
   - **Repository access**: Select "Selected repositories" and choose your target repository

#### Required Permissions:

**Repository permissions** (select these EXACT permissions):
- ✅ **Contents**: **Read and Write** - *Required to read and write the construction-data.json file*
- ✅ **Metadata**: **Read** - *Required for basic repository information access*

**Account permissions**: *None required*

4. Click **"Generate token"**
5. **Copy the token immediately** (you won't be able to see it again)

#### Configure the Token:

1. Edit the `index.html` file in your repository
2. Find this line:
   ```javascript
   const GITHUB_TOKEN = 'your_github_token_here';
   ```
3. Replace `'your_github_token_here'` with your actual token:
   ```javascript
   const GITHUB_TOKEN = 'github_pat_11ABC...XYZ';  // Your actual token
   ```

⚠️ **Security Note**: This token will be visible in your repository. Only use repositories you trust and consider the token's scope carefully.

### 2. Repository Setup

The application automatically creates a `construction-data.json` file in your repository to store data.

### 3. Access the Application

Visit: https://juruk.github.io/construction-project-manager/

## How It Works

### Data Storage Priority
1. **GitHub** (primary) - Data synced across all devices
2. **localStorage** (backup) - Offline storage and fallback
3. **Sample data** (initial) - Pre-populated example data

### Sync Features
- **Auto-sync**: Automatically saves to GitHub when online
- **Manual sync**: Click the sync button to force synchronization
- **Conflict resolution**: GitHub data takes priority over local changes
- **Status indicator**: Shows sync status (Synced, Syncing, Error, Offline)
- **Notifications**: Real-time feedback on sync operations

### Offline Support
- **Full functionality**: All CRUD operations work offline
- **localStorage backup**: Data persists locally when GitHub is unavailable  
- **Auto-reconnect**: Resumes sync when connection is restored
- **Visual feedback**: Clear indication of offline/online status

## Usage

1. **Add Items**: Use the "Add" buttons to create new projects, architects, etc.
2. **Edit/Delete**: Use card buttons to modify or remove items
3. **View Dashboard**: See overview statistics of all data
4. **Monitor Sync**: Check sync status in the top-right corner
5. **Manual Sync**: Click "Sync" button to force synchronization

## Technical Details

- **Frontend**: Pure HTML, CSS, JavaScript
- **Storage**: GitHub Contents API + localStorage fallback
- **Authentication**: Fine-grained Personal Access Token
- **Sync**: REST API calls to GitHub Contents API
- **Offline**: Service worker-free offline functionality
- **Responsive**: Works on desktop and mobile devices

## GitHub Token Permissions Explained

### Why These Specific Permissions?

**Contents (Read and Write)**:
- **Read**: Load existing construction-data.json from your repository
- **Write**: Save updated data back to construction-data.json
- **File Management**: Create the data file if it doesn't exist

**Metadata (Read)**:
- **Repository Info**: Access basic repository information
- **API Compatibility**: Required for GitHub Contents API access

### What These Permissions DON'T Allow:
- Cannot access other repositories
- Cannot modify repository settings
- Cannot access organization data
- Cannot manage repository permissions
- Cannot access sensitive account information

## Troubleshooting

### Sync Issues
- **Token Error**: Verify token has Contents (Read & Write) and Metadata (Read) permissions
- **403 Forbidden**: Check if token is properly configured and has access to the repository
- **Network Error**: Confirm internet connectivity
- **Repository Access**: Ensure the repository exists and token has access to it

### Token Permission Issues
If you see sync errors:
1. Go to GitHub Settings > Personal Access Tokens > Fine-grained tokens
2. Find your token and click "Edit"
3. Verify the repository is selected under "Repository access"
4. Confirm **Contents** is set to **Read and write**
5. Confirm **Metadata** is set to **Read**
6. Save changes and try syncing again

### Data Recovery
- Data is always backed up in localStorage
- GitHub repository contains full data history
- Use manual sync to resolve conflicts
- Check browser console for detailed error messages

Built with reliability and simplicity in mind for construction project management.