// faq.js - Adds interactivity to the FAQ page

// Wait for the entire HTML document to be loaded and parsed before running any code
document.addEventListener('DOMContentLoaded', function() {

  // =====================
  // FAQ ITEM TOGGLE
  // =====================

  // Find every button with the class 'faq-question' on the page
  const questions = document.querySelectorAll('.faq-question');

  // Loop through each question button one at a time
  questions.forEach(function(question) {

    // Attach a click event to this question button
    question.addEventListener('click', function() {

      // Get the .faq-item div that directly contains this button
      const faqItem = question.parentElement;

      // Check if this item is already open
      if (faqItem.classList.contains('open')) {
        // If it is open, close it by removing the 'open' class
        faqItem.classList.remove('open');
      } else {
        // If it is closed, first close every other open FAQ item
        document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
          // Remove 'open' from each currently open item
          openItem.classList.remove('open');
        });
        // Then open the item that was just clicked
        faqItem.classList.add('open');
      }
    });
  });

  // =====================
  // NESTED CALC COLLAPSIBLE TOGGLE
  // =====================

  // Find every button with the class 'calc-toggle' on the page
  const calcToggles = document.querySelectorAll('.calc-toggle');

  // Loop through each calc toggle button one at a time
  calcToggles.forEach(function(toggle) {

    // Attach a click event to this toggle button
    toggle.addEventListener('click', function(event) {

      // Stop this click from also triggering the parent .faq-question click handler
      // Without this, clicking the calc toggle would also close the FAQ item
      event.stopPropagation();

      // Get the .calc-collapsible div that directly contains this button
      const calcBlock = toggle.parentElement;

      // Toggle the 'open' class on or off
      // If it's open, this removes 'open' (closes it); if it's closed, this adds 'open' (opens it)
      calcBlock.classList.toggle('open');
    });
  });

});