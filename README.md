# Schedule Sync

Schedule Sync is app for synchronization PDF schedules with Google and Outlook calendars.

## Installation with NPM

### For development

```
npm install
npm run dev
```

### For production

```
npm install
npm run build
```

The build output will be placed at `dist`. You may deploy this `dist` folder to any platform.

Also you may test the build locally by running command:

```
npm preview
```

## Setting environment variables

### Required url of schedules provider API

`/info` and `/schedules` endpoints will be used to get up-to-date schedules.

```
VITE_API_URL="https://api.example.com"
```

### Required Microsoft AAD app ID

This ID will be used in Microsoft OAuth process

```
VITE_AAD_APPID="your_client_id"
```

### Required Google Cloud Platform app ID

This ID will be used in Google OAuth process

```
VITE_GCP_APPID="your_client_id"
```
