// Patch Applier Page Specific JS

// NOTE: The Patch Notes collapsible section uses native HTML <details>/<summary> elements.
// These open and close automatically without any JavaScript — the browser handles it.
// No JS is needed for that feature.

// NOTE: The "Download the Patch" button uses a plain <a href="..." download="..."> link.
// The browser handles the file download natively — no JS needed for that either.

// -----------------------------------------------------------------------
// OPTIONAL: Track when a user clicks the Download button.
// This is useful if you ever want to know how many times the patch was downloaded.
// Currently just logs to the browser console — you could swap this for analytics later.
// -----------------------------------------------------------------------

// Wait until the full page HTML has loaded before running any JS
document.addEventListener("DOMContentLoaded", function () {

    // Find the Download button by its unique CSS class
    // querySelector returns the first element that matches the selector, or null if not found
    var downloadBtn = document.querySelector(".patch-btn-download");

    // Only attach the listener if the button actually exists on the page
    // This prevents errors if the button is ever removed or renamed
    if (downloadBtn) {

        // Listen for a "click" event on the download button
        downloadBtn.addEventListener("click", function () {

            // Log a message to the browser's developer console (F12 > Console tab)
            // This is harmless and invisible to users — useful for debugging
            console.log("Patch download initiated by user.");

            // FUTURE: Replace the console.log above with an analytics call, e.g.:
            // gtag("event", "patch_download", { version: "1.0" });
        });
    }
});