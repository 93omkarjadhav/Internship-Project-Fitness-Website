# Error Pages

This directory contains all error and status pages for the Fitfare application.

## Available Pages

### 1. **NotFoundPage** (`/error/not-found`)
- **Status Code**: 404
- **Use Case**: When a user tries to access a page that doesn't exist
- **Features**: Support ticket submission, back to dashboard

### 2. **ServerError** (`/error/server-error`)
- **Status Code**: 500
- **Use Case**: Internal server errors
- **Features**: Error reporting, back to dashboard

### 3. **NoInternet** (`/error/no-internet`)
- **Use Case**: Network connectivity issues
- **Features**: Refresh functionality, mailto support (since API won't work)

### 4. **NotAllowed** (`/error/not-allowed`)
- **Status Code**: 403
- **Use Case**: Permission/authorization errors
- **Features**: Support ticket submission, back to dashboard

### 5. **Maintenance** (`/error/maintenance`)
- **Use Case**: Scheduled maintenance periods
- **Features**: Dynamic countdown timer, support tickets, back to dashboard

### 6. **UpdateRequired** (`/error/update-required`)
- **Use Case**: Force app update for users with outdated versions
- **Features**: Dynamic version display, redirect to app store

### 7. **FeatureLocked** (`/error/feature-locked`)
- **Use Case**: Premium features that require subscription
- **Features**: Subscription upgrade prompts

### 8. **NothingToShow** (`/error/nothing-to-show`)
- **Use Case**: Empty states when no data is available
- **Features**: Feedback submission, back to dashboard

## Usage

### Import Individual Pages
```typescript
import { ServerError, NoInternet, NotFoundPage } from "@/pages/Error_pages";
```

### Redirect to Error Pages
```typescript
// In your component
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/error/server-error");
```

### Using in Try-Catch Blocks
```typescript
try {
  const response = await api.get("/some-endpoint");
} catch (error) {
  if (error.response?.status === 500) {
    navigate("/error/server-error");
  } else if (error.response?.status === 403) {
    navigate("/error/not-allowed");
  } else if (error.message === "Network Error") {
    navigate("/error/no-internet");
  }
}
```

## Required Images

All error pages use images from `/public` directory:
- `notfound.png`
- `server.png`
- `network.png`
- `notallowed.png`
- `maintenance.png`
- `update.png`
- `feature.png`
- `nothing.png`
- `triangle.png` (warning icon)
- `internet-icon.png`
- `comment-icon.png`
- `home.png`
- `refresh-icon.png`
- `clock.png`
- `blue-clock.png`
- `update-icon.png`
- `dwarr-icon.png`
- `arr-white.png`
- `sub-icon.png`

## API Integration

Most error pages integrate with the backend API for support ticket submission:

### Support Endpoint
```typescript
POST /api/system/support
Body: {
  subject: string,
  message: string
}
```

### System Status Endpoint
```typescript
GET /api/system/status
Response: {
  type: "MAINTENANCE" | "UPDATE_REQUIRED",
  come_back_time?: string,
  latest_version?: string
}
```

## Customization

To customize error pages:
1. Edit the respective component in this directory
2. Update images in `/public` folder
3. Modify API endpoints in the component if needed
4. Update styling classes (using Tailwind CSS)

## Notes
- All pages use the Team-A frontend's centralized API configuration (`@/lib/api`)
- Error pages are accessible without authentication
- Support tickets gracefully handle API failures
- NoInternet page uses `mailto:` for support since API won't work offline

