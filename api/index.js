require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));

// API Routes
app.post('/api/track-click', async (req, res) => {
  try {
    const { productName, linkId, referrer, source, medium, campaign } = req.body;
    
    // Basic validation
    if (!productName || !linkId) {
      return res.status(400).json({ error: 'Product name and link ID are required' });
    }
    
    // Get client IP and user agent
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress || 
                      req.connection.socket?.remoteAddress || '';
    
    // Insert click data into database
    const query = `
      INSERT INTO affiliate_clicks 
        (product_name, link_id, referrer, user_agent, ip_address, source, medium, campaign) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id`;
    
    const values = [
      productName, 
      linkId, 
      referrer, 
      userAgent, 
      ipAddress,
      source || null,
      medium || null,
      campaign || null
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({ 
      success: true, 
      message: 'Click tracked successfully',
      clickId: result.rows[0].id
    });
    
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ 
      error: 'Failed to track click',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Analytics endpoint (protected, in a real app would need proper authentication)
app.get('/api/analytics', async (req, res) => {
  try {
    // Get basic product analytics
    const productAnalyticsQuery = `
      SELECT 
        product_name, 
        COUNT(*) as click_count,
        MIN(clicked_at) as first_click,
        MAX(clicked_at) as last_click
      FROM 
        affiliate_clicks
      GROUP BY 
        product_name
      ORDER BY 
        click_count DESC;
    `;
    
    // Get source analytics
    const sourceAnalyticsQuery = `
      SELECT 
        source, 
        COUNT(*) as click_count
      FROM 
        affiliate_clicks
      WHERE 
        source IS NOT NULL
      GROUP BY 
        source
      ORDER BY 
        click_count DESC
      LIMIT 10;
    `;
    
    // Get link placement analytics
    const linkAnalyticsQuery = `
      SELECT 
        link_id, 
        COUNT(*) as click_count
      FROM 
        affiliate_clicks
      GROUP BY 
        link_id
      ORDER BY 
        click_count DESC;
    `;
    
    // Execute all queries
    const productAnalyticsResult = await pool.query(productAnalyticsQuery);
    const sourceAnalyticsResult = await pool.query(sourceAnalyticsQuery);
    const linkAnalyticsResult = await pool.query(linkAnalyticsQuery);
    
    // Return combined results
    res.json({
      success: true,
      analytics: productAnalyticsResult.rows,
      sourceAnalytics: sourceAnalyticsResult.rows,
      linkAnalytics: linkAnalyticsResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Branduvo API is running' });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});