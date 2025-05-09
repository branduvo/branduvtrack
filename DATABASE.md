# Branduvo Database Integration

This document outlines how the Branduvo affiliate marketing website integrates with a PostgreSQL database to track affiliate link clicks and provide analytics.

## Overview

The database integration consists of:

1. **PostgreSQL Database** - Stores click data for all affiliate links
2. **API Server** - Node.js/Express server that handles tracking requests and analytics
3. **Frontend Tracking** - JavaScript code that captures clicks and sends data to the API
4. **Admin Dashboard** - Web interface to view click analytics

## Database Schema

The main table structure is:

```sql
CREATE TABLE affiliate_clicks (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  link_id VARCHAR(100) NOT NULL,
  referrer VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(100),
  medium VARCHAR(100),
  campaign VARCHAR(100)
);
```

## How Tracking Works

1. Affiliate links have special data attributes (`data-affiliate-track`, `data-product-name`, `data-link-id`)
2. When a user clicks an affiliate link, the click is intercepted by the `affiliate-tracker.js` script
3. The script sends tracking data to the API endpoint
4. The API stores the click information in the database
5. The user is redirected to the destination URL

## UTM Parameter Tracking

The system automatically captures UTM parameters from the page URL:
- `utm_source` → stored in the `source` column
- `utm_medium` → stored in the `medium` column
- `utm_campaign` → stored in the `campaign` column

This enables tracking of traffic sources and campaign effectiveness.

## Admin Dashboard

The admin dashboard at `/admin/` displays:
- Total clicks across all links
- Clicks by product
- Clicks by link placement
- Clicks by traffic source

The dashboard is protected by not being visible in the navigation menu.

## API Endpoints

### Track Click
```
POST /api/track-click
```
Payload:
```json
{
  "productName": "Product name",
  "linkId": "Location identifier",
  "referrer": "Page where click occurred",
  "source": "Traffic source (optional)",
  "medium": "Traffic medium (optional)",
  "campaign": "Campaign name (optional)"
}
```

### Get Analytics
```
GET /api/analytics
```
Returns:
```json
{
  "success": true,
  "analytics": [
    {
      "product_name": "Product name",
      "click_count": "Number of clicks",
      "first_click": "Timestamp of first click",
      "last_click": "Timestamp of last click"
    }
  ],
  "sourceAnalytics": [
    {
      "source": "Traffic source",
      "click_count": "Number of clicks"
    }
  ],
  "linkAnalytics": [
    {
      "link_id": "Link placement identifier",
      "click_count": "Number of clicks"
    }
  ]
}
```

## Servers

Two servers are needed to run the system:
1. **Jekyll Server** - Serves the static website content on port 5000
2. **API Server** - Handles database operations on port 3000

Both servers are configured in the Replit workflow configuration.

## Implementation Notes

- Database credentials are stored in environment variables
- The database connection uses SSL with disabled certificate validation for development
- All SQL queries use parameterized queries to prevent SQL injection
- Error handling ensures the user experience isn't broken even if tracking fails