/**
 * Affiliate Link Click Tracker
 * 
 * This script tracks clicks on affiliate links and sends the data to our database.
 * It also handles proper redirect to the affiliate link after tracking.
 */

(function() {
  // Configuration
  const API_ENDPOINT = 'http://localhost:3000/api/track-click';
  
  /**
   * Track a click on an affiliate link
   * @param {Event} event - The click event
   * @param {HTMLElement} element - The clicked link element
   * @param {string} productName - Name of the product being clicked
   * @param {string} linkId - Identifier for the specific link (e.g., 'header-cta', 'sidebar', etc.)
   */
  function trackAffiliateClick(event, element, productName, linkId) {
    // Prevent the default link behavior temporarily
    event.preventDefault();
    
    // Get the destination URL
    const destination = element.href;
    
    // Get referrer information
    const referrer = document.referrer || window.location.pathname;
    
    // Parse UTM parameters from the URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source') || element.getAttribute('data-source') || null;
    const medium = urlParams.get('utm_medium') || element.getAttribute('data-medium') || null;
    const campaign = urlParams.get('utm_campaign') || element.getAttribute('data-campaign') || null;
    
    // Prepare data for the API call
    const clickData = {
      productName: productName,
      linkId: linkId,
      referrer: referrer,
      source: source,
      medium: medium,
      campaign: campaign
    };
    
    // Create a fetch request to the tracking API
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clickData)
    })
    .then(response => {
      // After tracking is complete (or if it fails), redirect to the destination
      window.location.href = destination;
    })
    .catch(error => {
      // If there's an error, still redirect to ensure user experience isn't broken
      console.error('Error tracking affiliate click:', error);
      window.location.href = destination;
    });
  }
  
  /**
   * Initialize affiliate link tracking by adding event listeners to all links
   * with the appropriate data attributes
   */
  function initAffiliateTracking() {
    // Look for all links with data-affiliate-track attribute
    const affiliateLinks = document.querySelectorAll('a[data-affiliate-track]');
    
    // Add click event listeners to each link
    affiliateLinks.forEach(link => {
      const productName = link.getAttribute('data-product-name');
      const linkId = link.getAttribute('data-link-id');
      
      // Only track links that have the required attributes
      if (productName && linkId) {
        link.addEventListener('click', function(event) {
          trackAffiliateClick(event, link, productName, linkId);
        });
      }
    });
  }
  
  // Initialize tracking when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initAffiliateTracking);
})();