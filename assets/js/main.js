// Branduvo - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu toggle
  initMobileMenu();
  
  // Initialize smooth scrolling for anchor links
  initSmoothScroll();
  
  // Initialize form validation
  initFormValidation();
  
  // Initialize testimonial slider if it exists
  if (document.querySelector('.testimonials-slider')) {
    initTestimonialSlider();
  }
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainMenu = document.querySelector('.nav-menu');
  
  if (!menuToggle || !mainMenu) return;
  
  menuToggle.addEventListener('click', function() {
    const expanded = this.getAttribute('aria-expanded') === 'true' || false;
    this.setAttribute('aria-expanded', !expanded);
    mainMenu.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!menuToggle.contains(event.target) && !mainMenu.contains(event.target) && mainMenu.classList.contains('active')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      mainMenu.classList.remove('active');
    }
  });
  
  // Close menu when window is resized beyond mobile breakpoint
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && mainMenu.classList.contains('active')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      mainMenu.classList.remove('active');
    }
  });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      // Skip if it's just "#" or no valid target exists
      if (targetId === '#' || !document.querySelector(targetId)) return;
      
      e.preventDefault();
      
      const targetElement = document.querySelector(targetId);
      const headerOffset = 100; // Adjust based on fixed header height
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // If mobile menu is open, close it
      const mainMenu = document.querySelector('.nav-menu');
      const menuToggle = document.querySelector('.menu-toggle');
      if (mainMenu && mainMenu.classList.contains('active')) {
        mainMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

/**
 * Basic form validation for contact and newsletter forms
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      let hasError = false;
      
      // Check required fields
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          e.preventDefault();
          hasError = true;
          highlightFieldError(field);
        } else {
          removeFieldError(field);
        }
      });
      
      // Email validation for email fields
      const emailFields = form.querySelectorAll('input[type="email"]');
      emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
          e.preventDefault();
          hasError = true;
          highlightFieldError(field, 'Please enter a valid email address');
        }
      });
      
      // Show form error message if needed
      const formError = form.querySelector('.form-error');
      if (hasError && formError) {
        formError.style.display = 'block';
      } else if (formError) {
        formError.style.display = 'none';
      }
    });
  });
  
  // Set up live validation on blur
  document.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('blur', function() {
      if (this.hasAttribute('required') && !this.value.trim()) {
        highlightFieldError(this);
      } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
        highlightFieldError(this, 'Please enter a valid email address');
      } else {
        removeFieldError(this);
      }
    });
    
    // Clear error styling on input
    field.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        removeFieldError(this);
      }
    });
  });
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Highlight field with error styling
 * @param {HTMLElement} field - The form field with an error
 * @param {string} message - Optional custom error message
 */
function highlightFieldError(field, message) {
  field.classList.add('error');
  
  // Add error styling to field
  field.style.borderColor = '#dc3545';
  
  // Find or create error message element
  let errorElement = field.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('field-error')) {
    errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }
  
  // Set error message
  errorElement.textContent = message || 'This field is required';
}

/**
 * Remove error styling from field
 * @param {HTMLElement} field - The form field to clean up
 */
function removeFieldError(field) {
  field.classList.remove('error');
  field.style.borderColor = '';
  
  // Remove error message if it exists
  const errorElement = field.nextElementSibling;
  if (errorElement && errorElement.classList.contains('field-error')) {
    errorElement.remove();
  }
}

/**
 * Simple testimonial slider with auto-rotation
 */
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonials-slider');
  const testimonials = slider.querySelectorAll('.testimonial-item');
  
  if (testimonials.length <= 1) return;
  
  // Create navigation dots
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'slider-dots';
  dotsContainer.style.display = 'flex';
  dotsContainer.style.justifyContent = 'center';
  dotsContainer.style.marginTop = '20px';
  
  testimonials.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.borderRadius = '50%';
    dot.style.background = index === 0 ? '#4a6bdf' : '#e9ecef';
    dot.style.border = 'none';
    dot.style.margin = '0 5px';
    dot.style.padding = '0';
    dot.style.cursor = 'pointer';
    dot.dataset.index = index;
    
    dotsContainer.appendChild(dot);
  });
  
  slider.after(dotsContainer);
  
  // Set initial state
  let currentIndex = 0;
  updateSlider();
  
  // Set up auto-rotation
  let intervalId = setInterval(nextSlide, 5000);
  
  // Add click handlers to dots
  dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
    dot.addEventListener('click', function() {
      currentIndex = parseInt(this.dataset.index);
      updateSlider();
      resetInterval();
    });
  });
  
  function nextSlide() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateSlider();
  }
  
  function updateSlider() {
    // Update testimonials visibility
    testimonials.forEach((testimonial, index) => {
      if (window.innerWidth < 576) {
        // On mobile, show only current testimonial
        testimonial.style.display = index === currentIndex ? 'block' : 'none';
      } else {
        // On desktop, show based on grid layout
        testimonial.style.display = 'block';
      }
    });
    
    // Update dots
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, index) => {
      dot.style.background = index === currentIndex ? '#4a6bdf' : '#e9ecef';
    });
  }
  
  function resetInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(nextSlide, 5000);
  }
  
  // Update slider when window is resized
  window.addEventListener('resize', updateSlider);
}
