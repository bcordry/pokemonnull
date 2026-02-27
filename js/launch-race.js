/* ============================================================
   LAUNCH-RACE.JS
   JavaScript specific to the Launch Event page (launch-race.html).
   Responsibility: drive the large on-page countdown timer.

   The small countdown tooltip in the nav header is handled by
   main.js (which is also loaded on this page), so we don't
   duplicate that logic here.
   ============================================================ */


/* ============================================================
   CONFIGURATION
   Change EVENT_DATE to update the target date/time.
   The string format is: "YYYY-MM-DDTHH:MM:SS" in the local
   timezone of the server/viewer, OR you can append a timezone
   offset like "-05:00" for EST.
   ============================================================ */

/* Target date: March 2nd 2026 at 2:00 PM Eastern Standard Time.
   EST is UTC-5, so 14:00 EST = 19:00 UTC → "2026-03-02T19:00:00Z"
   Using the UTC form avoids ambiguity across viewer timezones.    */
const EVENT_DATE = new Date("2026-03-02T19:00:00Z");
/* ^ new Date(string) — parses an ISO 8601 date string into a
   JavaScript Date object. The "Z" suffix means UTC.              */


/* ============================================================
   ELEMENT REFERENCES
   Grab the four number spans and the outer countdown container
   once at startup so we don't query the DOM on every tick.
   ============================================================ */

/* document.getElementById(id) — returns the element whose id
   attribute matches the string, or null if not found.           */
const cdDays    = document.getElementById("cd-days");    /* The "days" number span    */
const cdHours   = document.getElementById("cd-hours");   /* The "hours" number span   */
const cdMinutes = document.getElementById("cd-minutes"); /* The "minutes" number span */
const cdSeconds = document.getElementById("cd-seconds"); /* The "seconds" number span */
const cdWrapper = document.getElementById("event-countdown"); /* The outer container  */


/* ============================================================
   HELPER: pad
   Ensures a number is always displayed with at least 2 digits.
   e.g. pad(5) → "05",  pad(12) → "12"
   ============================================================ */

/**
 * @param {number} n  — the number to pad
 * @returns {string}  — zero-padded string, minimum 2 characters
 */
function pad(n) {
    /* String(n)          — convert the number to a string
       .padStart(2, "0")  — if the string is shorter than 2 chars,
                            prepend "0"s until it is 2 chars long  */
    return String(n).padStart(2, "0");
}


/* ============================================================
   CORE FUNCTION: updateCountdown
   Called once immediately and then every 1000 ms (1 second).
   Calculates the remaining time and updates the DOM.
   ============================================================ */

function updateCountdown() {

    /* Date.now() — returns the current time as milliseconds since
       the Unix epoch (Jan 1 1970 UTC). This is the fastest way to
       get "right now" as a number.                               */
    const now = Date.now();

    /* EVENT_DATE.getTime() — same format (ms since epoch) for the
       target date. Subtracting gives us the gap in milliseconds.  */
    const diff = EVENT_DATE.getTime() - now;
    /* diff will be:
       - positive  → event is in the future (countdown running)
       - zero      → event is happening right now
       - negative  → event has already passed                      */


    /* ---- EVENT HAS PASSED ---- */
    if (diff <= 0) {
        /* The event is live or over — show a "LIVE NOW" message
           instead of the countdown blocks.                        */

        /* cdWrapper.classList.add("event-live") — adds the CSS class
           "event-live" to the countdown container. The CSS file uses
           this class to change the number colour to red.           */
        cdWrapper.classList.add("event-live");

        /* Set each number span to a special value */
        cdDays.textContent    = "00"; /* textContent sets the visible text of the element */
        cdHours.textContent   = "00";
        cdMinutes.textContent = "00";
        cdSeconds.textContent = "00";

        /* clearInterval(intervalId) — stops the setInterval timer
           so we don't keep running the function every second after
           the event has passed. intervalId is defined below.       */
        clearInterval(intervalId);

        /* Exit the function early — nothing more to calculate */
        return;
    }


    /* ---- CALCULATE TIME UNITS ---- */

    /* Math.floor(x) — rounds x DOWN to the nearest integer.
       We use it to convert milliseconds into whole seconds/minutes/etc. */

    /* Total whole seconds remaining */
    const totalSeconds = Math.floor(diff / 1000);
    /* ^ diff is in ms; dividing by 1000 gives seconds (with decimals);
       Math.floor removes the decimal part.                          */

    /* Extract days: 1 day = 86400 seconds (60 * 60 * 24) */
    const days    = Math.floor(totalSeconds / 86400);

    /* Extract remaining hours after removing full days.
       % is the modulo operator — gives the remainder after division.
       e.g. 90000 seconds % 86400 = 3600 → 1 hour remaining.        */
    const hours   = Math.floor((totalSeconds % 86400) / 3600);

    /* Extract remaining minutes after removing full hours */
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    /* Extract remaining seconds after removing full minutes */
    const seconds = totalSeconds % 60;


    /* ---- UPDATE THE DOM ---- */

    /* Set each span's text to the padded value.
       pad() ensures single-digit numbers show as "05" not "5".     */
    cdDays.textContent    = pad(days);
    cdHours.textContent   = pad(hours);
    cdMinutes.textContent = pad(minutes);
    cdSeconds.textContent = pad(seconds);
}


/* ============================================================
   INITIALISE
   Run the function once immediately so the timer shows correct
   values the instant the page loads (no 1-second blank delay).
   Then set it to run every 1000 ms (1 second) after that.
   ============================================================ */

/* Call once right away */
updateCountdown();

/* setInterval(fn, ms) — calls fn repeatedly, every ms milliseconds.
   We store the return value (a numeric ID) in intervalId so we can
   cancel it with clearInterval() when the event has passed.        */
const intervalId = setInterval(updateCountdown, 1000);
/* ^ 1000 ms = 1 second                                             */