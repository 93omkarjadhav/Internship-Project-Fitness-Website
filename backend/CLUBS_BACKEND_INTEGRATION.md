# Clubs & System Management Backend Integration

## Overview
Successfully integrated clubs, system settings, and support ticket functionality from nutrition-work backend into Team-A backend application.

## Integration Date
December 5, 2025

## What Was Added

### 1. Database Schema
**File**: `src/db/migrations/add_clubs_and_system_tables.sql`

#### New Tables:
- **`clubs`** - Fitness/wellness clubs and gyms
  - Stores club information: name, location, price, rating, facilities
  - Supports search and filtering by price
  - Includes JSON field for facilities array

- **`system_settings`** - Global app configuration
  - Maintenance mode management
  - App version control
  - Privacy policy and terms URLs
  - Support contact information

- **`support_tickets`** - Customer support system
  - User support requests
  - Ticket status tracking
  - Priority management
  - Assignment system

- **`users` table updates**:
  - Added `subscription_status` ENUM('free', 'plus', 'premium')
  - Added `subscription_expires_at` TIMESTAMP

### 2. Models
**File**: `src/models/Club.js`

#### Methods:
- `findByPrice(maxPrice)` - Get clubs under a price limit
- `search(term)` - Search clubs by name, location, description
- `findById(id)` - Get single club details
- `findAll(limit, offset)` - Get all clubs with pagination
- `findByLocation(location)` - Filter clubs by location
- `create(clubData)` - Create new club
- `update(id, clubData)` - Update existing club
- `delete(id)` - Delete club

### 3. Controllers

#### Club Controller (`src/controllers/clubController.js`)
- `getClubs` - GET clubs with filters (price, search, location)
- `getClubById` - GET single club details
- `createClub` - POST create new club (admin)
- `updateClub` - PUT update club (admin)
- `deleteClub` - DELETE remove club (admin)
- `getClubsByPriceRanges` - GET clubs grouped by price ranges

#### System Controller (`src/controllers/systemController.js`)
- `checkSystemStatus` - Check maintenance mode & app version
- `submitSupportTicket` - Submit customer support ticket
- `getMyTickets` - Get user's support tickets
- `getAllTickets` - Get all tickets (admin)
- `updateTicketStatus` - Update ticket status (admin)
- `updateSystemSettings` - Update system config (admin)
- `getSystemSettings` - Get public system settings

### 4. Routes

#### Club Routes (`src/routes/clubRoutes.js`)
```
GET    /api/clubs                  - Get all clubs (with filters)
GET    /api/clubs/price-ranges     - Get clubs by price ranges
GET    /api/clubs/:id              - Get single club
POST   /api/clubs                  - Create club (auth required)
PUT    /api/clubs/:id              - Update club (auth required)
DELETE /api/clubs/:id              - Delete club (auth required)
```

#### System Routes (`src/routes/systemRoutes.js`)
```
GET    /api/system/status                - Check system status
POST   /api/system/support               - Submit support ticket
GET    /api/system/settings              - Get public settings
GET    /api/system/support/my-tickets    - Get user tickets (auth)
GET    /api/system/support/all           - Get all tickets (admin)
PATCH  /api/system/support/:id           - Update ticket (admin)
PUT    /api/system/settings              - Update settings (admin)
```

### 5. Middleware
**File**: `src/middleware/subscriptionAuth.js`

- `requireSubscription` - Check for Plus or Premium subscription
- `requirePremium` - Check for Premium subscription only
- `checkSubscription` - Add subscription info without blocking

## API Usage Examples

### Get Clubs by Price
```javascript
// Get clubs under Rs 80/day
GET /api/clubs?maxPrice=80

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Go Fitness Club",
      "location": "Pune City",
      "price_per_day": 30.00,
      "rating": 4.5,
      "facilities": ["Gym", "Cardio", "Weights"],
      "opening_hours": "6 AM - 10 PM"
    }
  ]
}
```

### Search Clubs
```javascript
// Search for gyms
GET /api/clubs?search=gym

// Search by location
GET /api/clubs?location=Pune
```

### Check System Status
```javascript
// Check for maintenance or updates
GET /api/system/status?version=1.0.0

Response (Maintenance):
{
  "type": "MAINTENANCE",
  "status": "maintenance",
  "message": "Server is under maintenance",
  "come_back_time": "2025-12-06T10:00:00Z",
  "status_code": 503
}

Response (Update Required):
{
  "type": "UPDATE_REQUIRED",
  "status": "update_required",
  "message": "Update Required. v1.2.9 is live.",
  "latest_version": "1.2.9",
  "min_version": "1.2.0",
  "status_code": 426
}

Response (OK):
{
  "status": "ok",
  "message": "System operational",
  "latest_version": "1.2.9"
}
```

### Submit Support Ticket
```javascript
// Submit a support request
POST /api/system/support
Content-Type: application/json

{
  "subject": "404 Not Found",
  "message": "I encountered an error on the clubs page",
  "priority": "medium"
}

Response:
{
  "success": true,
  "message": "Support ticket submitted successfully",
  "ticket_id": 123
}
```

### Protected Route Example (Feature Lock)
```javascript
// Protect premium features
import { requireSubscription } from './middleware/subscriptionAuth.js';

app.get('/api/premium-feature', 
  authenticateToken, 
  requireSubscription, 
  (req, res) => {
    res.json({ message: "Welcome to Plus features!" });
  }
);

// If user doesn't have subscription:
Response (403):
{
  "success": false,
  "message": "This feature requires a subscription. Please upgrade to Plus or Premium.",
  "type": "FEATURE_LOCKED",
  "subscription_status": "free",
  "feature_locked": true
}
```

## Database Setup

### 1. Run Migration
```bash
# Connect to MySQL
mysql -u your_user -p

# Run migration script
mysql -u your_user -p db_week_one_up < src/db/migrations/add_clubs_and_system_tables.sql
```

### 2. Verify Tables
```sql
USE db_week_one_up;
SHOW TABLES;
-- Should show: clubs, system_settings, support_tickets

-- Check users table for new columns
DESCRIBE users;
-- Should see: subscription_status, subscription_expires_at
```

### 3. Sample Data
The migration script includes sample club data:
- 6 fitness clubs in Pune City
- Price range: Rs 25 - Rs 120 per day
- Various facilities and ratings

## Frontend Integration

### API Client Usage
```typescript
// In frontend/src/lib/api.ts (already configured)
import api from "@/lib/api";

// Get clubs by price
const clubs = await api.get("/clubs", {
  params: { maxPrice: 80 }
});

// Search clubs
const searchResults = await api.get("/clubs", {
  params: { search: "gym" }
});

// Check system status
const status = await api.get("/system/status", {
  params: { version: "1.0.0" }
});

// Submit support ticket
const ticket = await api.post("/system/support", {
  subject: "Issue with clubs page",
  message: "Description of the issue"
});
```

### Error Handling
```typescript
try {
  const response = await api.get("/clubs");
} catch (error) {
  if (error.response?.status === 503) {
    // Maintenance mode
    navigate("/error/maintenance");
  } else if (error.response?.status === 426) {
    // Update required
    navigate("/error/update-required");
  } else if (error.response?.data?.feature_locked) {
    // Feature locked
    navigate("/error/feature-locked");
  }
}
```

## Testing

### Test Clubs API
```bash
# Get all clubs
curl http://localhost:3001/api/clubs

# Filter by price
curl http://localhost:3001/api/clubs?maxPrice=50

# Search clubs
curl http://localhost:3001/api/clubs?search=fitness

# Get club by ID
curl http://localhost:3001/api/clubs/1
```

### Test System API
```bash
# Check system status
curl http://localhost:3001/api/system/status?version=1.0.0

# Submit support ticket
curl -X POST http://localhost:3001/api/system/support \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test","message":"Test ticket"}'
```

### Test Subscription Protection
```bash
# Try accessing premium feature without auth
curl http://localhost:3001/api/premium-feature

# With auth token (replace YOUR_TOKEN)
curl http://localhost:3001/api/premium-feature \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Admin Operations

### Enable Maintenance Mode
```javascript
PUT /api/system/settings
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "maintenance_mode": true,
  "maintenance_end_time": "2025-12-06T10:00:00Z",
  "maintenance_message": "Scheduled maintenance in progress"
}
```

### Update App Version Requirements
```javascript
PUT /api/system/settings
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "min_app_version": "1.3.0",
  "latest_app_version": "1.3.5"
}
```

### Manage Support Tickets
```javascript
// Get all tickets
GET /api/system/support/all?status=open

// Update ticket status
PATCH /api/system/support/123
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "resolved",
  "assigned_to": "admin@fitfare.com"
}
```

## Environment Variables

No new environment variables required. Uses existing configuration:
- `PORT` - Server port (default: 3001)
- `DATABASE_*` - MySQL connection settings
- `JWT_SECRET` - For authentication

## Migration Notes

### Changes from Original nutrition-work

1. **ES Modules**: Converted from CommonJS to ES6 modules
   - Original: `require()` and `module.exports`
   - Updated: `import/export` syntax

2. **Database Connection**: Uses Team-A's connection pool
   - Original: `const db = require('../config/db')`
   - Updated: `import { pool } from '../db/connection.js'`

3. **Middleware Integration**: Uses Team-A's auth middleware
   - Original: Custom auth
   - Updated: Uses existing `authenticateToken`

4. **Error Responses**: Consistent with Team-A format
   - Added `success` field to all responses
   - Standardized error structure

5. **Route Prefixes**: Maintained `/api/*` convention
   - Clubs: `/api/clubs/*`
   - System: `/api/system/*`

## File Structure
```
backend/src/
├── controllers/
│   ├── clubController.js          (NEW)
│   └── systemController.js        (NEW)
├── models/
│   └── Club.js                    (NEW)
├── routes/
│   ├── clubRoutes.js              (NEW)
│   └── systemRoutes.js            (NEW)
├── middleware/
│   └── subscriptionAuth.js        (NEW)
├── db/
│   └── migrations/
│       └── add_clubs_and_system_tables.sql  (NEW)
└── index.js                       (MODIFIED)
```

## Testing Checklist

- [x] Database migration runs successfully
- [x] Club model methods work correctly
- [x] Clubs API endpoints respond correctly
- [x] System status check works
- [x] Support ticket submission works
- [x] Subscription middleware protects routes
- [x] Error responses match frontend expectations
- [x] No conflicts with existing routes
- [x] ES6 module imports work
- [x] Database queries use connection pool

## Known Limitations

1. **Admin Authorization**: Admin routes currently use `authenticateToken` only
   - TODO: Add role-based access control (RBAC)
   - Workaround: Check `req.user.role` in admin routes

2. **Version Comparison**: Uses simple string comparison
   - TODO: Implement semver library for proper version comparison
   - Current: Works for simple versions (1.0.0, 1.2.0, etc.)

3. **Support Tickets**: No email notifications yet
   - TODO: Integrate with emailService.js
   - Workaround: Check tickets via API

## Next Steps

1. **Add Admin Dashboard** for managing:
   - Clubs (create, update, delete)
   - System settings (maintenance, versions)
   - Support tickets (view, assign, resolve)

2. **Implement RBAC** for admin operations

3. **Add Email Notifications** for support tickets

4. **Create Frontend Components** for clubs display

5. **Add Search Autocomplete** for clubs search

6. **Implement Club Bookings** (future enhancement)

## Support

For issues or questions:
- Check this documentation
- Review API response formats
- Test endpoints with curl/Postman
- Check server logs for errors

## Conclusion

✅ Backend integration complete
✅ All APIs functional and tested
✅ Database schema updated
✅ Middleware and routes configured
✅ Ready for frontend integration

The clubs and system management features are now fully integrated into the Team-A backend and ready for use!

