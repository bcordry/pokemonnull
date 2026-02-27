// faq.js - Adds interactivity to the FAQ page

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
  // Select all elements with the class 'faq-question'
  const questions = document.querySelectorAll('.faq-question');

  // Loop through each question button
  questions.forEach(function(question) {
    // Add a click event listener to each question
    question.addEventListener('click', function() {
      // Get the parent .faq-item element of the clicked question
      const faqItem = question.parentElement;

      // If this item is already open, close it
      if (faqItem.classList.contains('open')) {
        faqItem.classList.remove('open');
      } else {
        // Otherwise, close all other open items first
        document.querySelectorAll('.faq-item.open').forEach(function(openItem) {
          openItem.classList.remove('open');
        });
        // Then open the clicked item
        faqItem.classList.add('open');
      }
    });
  });
});