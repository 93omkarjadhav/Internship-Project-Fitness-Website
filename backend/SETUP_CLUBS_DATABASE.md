# Quick Setup Guide - Clubs & System Features

## Step 1: Run Database Migration

### Option A: Using MySQL Command Line
```bash
# Navigate to backend directory
cd Team-A/backend

# Run the migration script
mysql -u your_username -p db_week_one_up < src/db/migrations/add_clubs_and_system_tables.sql

# Enter your MySQL password when prompted
```

### Option B: Using MySQL Workbench or phpMyAdmin
1. Open MySQL Workbench/phpMyAdmin
2. Select database: `db_week_one_up`
3. Open file: `src/db/migrations/add_clubs_and_system_tables.sql`
4. Execute the script

### Option C: Manual SQL Execution
```sql
-- Connect to MySQL
mysql -u your_username -p

-- Select database
USE db_week_one_up;

-- Copy and paste contents of add_clubs_and_system_tables.sql
-- Then execute
```

## Step 2: Verify Database Setup

```sql
-- Check if tables were created
USE db_week_one_up;
SHOW TABLES;
/* Should show:
   - clubs
   - system_settings
   - support_tickets
*/

-- Verify clubs data
SELECT COUNT(*) FROM clubs;
-- Should return: 6

-- Verify system settings
SELECT * FROM system_settings;
-- Should return: 1 row with default settings

-- Check users table updates
DESCRIBE users;
-- Should show: subscription_status, subscription_expires_at columns
```

## Step 3: Start the Backend Server

```bash
# Make sure you're in the backend directory
cd Team-A/backend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# OR start production server
npm start
```

## Step 4: Test the APIs

### Test Clubs API
```bash
# Get all clubs
curl http://localhost:3001/api/clubs

# Get clubs under Rs 50
curl http://localhost:3001/api/clubs?maxPrice=50

# Search for "fitness"
curl "http://localhost:3001/api/clubs?search=fitness"

# Get club by ID
curl http://localhost:3001/api/clubs/1
```

### Test System API
```bash
# Check system status
curl http://localhost:3001/api/system/status

# Check with version
curl "http://localhost:3001/api/system/status?version=1.0.0"

# Submit support ticket
curl -X POST http://localhost:3001/api/system/support \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test Ticket","message":"This is a test support ticket","priority":"low"}'
```

### Expected Responses

#### Clubs API Success
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "name": "Go Fitness Club",
      "description": "A space designed for exercise, fitness training, and wellness.",
      "location": "Pune City",
      "price_per_day": 30.00,
      "rating": 4.5,
      "facilities": ["Gym", "Cardio", "Weights", "Personal Training"],
      "opening_hours": "6 AM - 10 PM",
      "contact_number": "+91-9876543210"
    }
    // ... more clubs
  ]
}
```

#### System Status Success
```json
{
  "status": "ok",
  "message": "System operational",
  "latest_version": "1.2.9",
  "privacy_policy_url": null,
  "terms_url": null
}
```

#### Support Ticket Success
```json
{
  "success": true,
  "message": "Support ticket submitted successfully",
  "ticket_id": 1
}
```

## Step 5: Update Frontend API Calls

The frontend already has the error pages setup. Now you just need to integrate the clubs display:

### Example Frontend Component
```typescript
// In your React component
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function ClubsList() {
  const [clubs, setClubs] = useState([]);
  const [maxPrice, setMaxPrice] = useState(9999);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.get('/clubs', {
          params: { maxPrice }
        });
        setClubs(response.data);
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
      }
    };

    fetchClubs();
  }, [maxPrice]);

  return (
    <div>
      {/* Filter buttons */}
      <button onClick={() => setMaxPrice(40)}>
        Clubs within Rs. 40/Day
      </button>
      <button onClick={() => setMaxPrice(80)}>
        Clubs within Rs. 80/Day
      </button>
      
      {/* Clubs list */}
      {clubs.map(club => (
        <div key={club.id}>
          <h3>{club.name}</h3>
          <p>{club.location}</p>
          <p>Rs. {club.price_per_day}/Day</p>
          <p>Rating: {club.rating}⭐</p>
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Error: Table already exists
```sql
-- Drop existing tables if needed
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS system_settings;

-- Then re-run the migration
```

### Error: Column already exists
```sql
-- Check if columns exist
DESCRIBE users;

-- If subscription columns already exist, skip or modify migration
```

### Error: Connection refused
```bash
# Make sure MySQL is running
sudo systemctl status mysql

# Check your database credentials in .env file
# DATABASE_HOST=localhost
# DATABASE_USER=your_user
# DATABASE_PASSWORD=your_password
# DATABASE_NAME=db_week_one_up
```

### Error: Cannot find module
```bash
# Reinstall dependencies
cd Team-A/backend
rm -rf node_modules package-lock.json
npm install
```

## Testing Subscription Features

### Set User Subscription Status
```sql
-- Update a user to Plus subscription
UPDATE users 
SET subscription_status = 'plus', 
    subscription_expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
WHERE id = 1;

-- Update to Premium
UPDATE users 
SET subscription_status = 'premium',
    subscription_expires_at = DATE_ADD(NOW(), INTERVAL 365 DAY)
WHERE id = 1;

-- Set back to free
UPDATE users 
SET subscription_status = 'free',
    subscription_expires_at = NULL
WHERE id = 1;
```

### Test Feature Lock
```bash
# Create a protected route in your backend
# Then test with and without subscription

# Without subscription (should return 403)
curl -X GET http://localhost:3001/api/premium-feature \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
# {
#   "success": false,
#   "message": "This feature requires a subscription...",
#   "type": "FEATURE_LOCKED",
#   "feature_locked": true
# }
```

## Admin Tasks

### Enable Maintenance Mode
```sql
UPDATE system_settings 
SET maintenance_mode = TRUE,
    maintenance_end_time = DATE_ADD(NOW(), INTERVAL 2 HOUR),
    maintenance_message = 'Scheduled maintenance in progress. We will be back soon!'
WHERE id = 1;

-- Test system status
-- Should return 503 with maintenance message
```

### Disable Maintenance Mode
```sql
UPDATE system_settings 
SET maintenance_mode = FALSE
WHERE id = 1;
```

### Update App Version Requirements
```sql
UPDATE system_settings 
SET min_app_version = '1.3.0',
    latest_app_version = '1.3.5'
WHERE id = 1;

-- Test with old version
-- Should return 426 (Upgrade Required)
```

### View Support Tickets
```sql
-- All open tickets
SELECT * FROM support_tickets 
WHERE status = 'open' 
ORDER BY created_at DESC;

-- Tickets by priority
SELECT * FROM support_tickets 
WHERE priority = 'high' 
ORDER BY created_at DESC;

-- Resolve a ticket
UPDATE support_tickets 
SET status = 'resolved', 
    resolved_at = NOW() 
WHERE id = 1;
```

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend APIs running
3. ✅ Test APIs working
4. 🔄 Create frontend components for clubs display
5. 🔄 Integrate system status checks in app initialization
6. 🔄 Add admin dashboard for managing clubs and settings

## Support

If you encounter any issues:
1. Check server logs: `npm run dev` output
2. Check MySQL logs: `/var/log/mysql/error.log`
3. Verify database connection in `.env` file
4. Review `CLUBS_BACKEND_INTEGRATION.md` for detailed docs

## Success Indicators

✅ Migration script runs without errors
✅ All 4 tables exist in database
✅ Sample club data is present (6 clubs)
✅ Backend server starts successfully
✅ API endpoints return expected responses
✅ No linter errors in backend code
✅ Frontend can fetch clubs data

Your integration is complete when all indicators show ✅!

