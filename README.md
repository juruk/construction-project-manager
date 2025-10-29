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

### 1. GitHub Token Configuration

To enable GitHub synchronization, you need to configure a GitHub token:

1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
2. Create a new token with `repo` permissions
3. Copy the token
4. Edit the `index.html` file and replace `'your_github_token_here'` with your actual token:

```javascript
const GITHUB_TOKEN = 'your_actual_github_token_here';
```

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
- **Storage**: GitHub API + localStorage fallback
- **Sync**: REST API calls to GitHub Contents API
- **Offline**: Service worker-free offline functionality
- **Responsive**: Works on desktop and mobile devices

## Troubleshooting

### Sync Issues
- Verify GitHub token has `repo` permissions
- Check network connectivity
- Ensure repository exists and is accessible
- Review browser console for error messages

### Data Recovery
- Data is always backed up in localStorage
- GitHub repository contains full data history
- Use manual sync to resolve conflicts

Built with reliability and simplicity in mind for construction project management.