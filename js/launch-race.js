/* ====
   LAUNCH-RACE.JS
   JavaScript specific to the Launch Event page (launch-race.html).
   Responsibility: drive the large on-page countdown timer.

   The small countdown tooltip in the nav header is handled by
   main.js (which is also loaded on this page), so we don't
   duplicate that logic here.
   ==== */


/* ====
   CONFIGURATION
   Change EVENT_DATE to update the target date/time.
   The string format is: "YYYY-MM-DDTHH:MM:SS" in the local
   timezone of the server/viewer, OR you can append a timezone
   offset like "-05:00" for EST.
   ==== */

/* Target date: March 2nd 2026 at 2:00 PM Eastern Standard Time.
   EST is UTC-5, so 14:00 EST = 19:00 UTC → "2026-03-02T19:00:00Z"
   Using the UTC form avoids ambiguity across viewer timezones.    */
const EVENT_DATE = new Date("2026-03-02T19:00:00Z");
/* ^ new Date(string) — parses an ISO 8601 date string into a
   JavaScript Date object. The "Z" suffix means UTC.              */


/* ====
   ELEMENT REFERENCES
   Grab the four number spans and the outer countdown container
   once at startup so we don't query the DOM on every tick.
   ==== */

/* document.getElementById(id) — returns the element whose id
   attribute matches the string, or null if not found.           */
const cdDays    = document.getElementById("cd-days");    /* The "days" number span    */
const cdHours   = document.getElementById("cd-hours");   /* The "hours" number span   */
const cdMinutes = document.getElementById("cd-minutes"); /* The "minutes" number span */
const cdSeconds = document.getElementById("cd-seconds"); /* The "seconds" number span */
const cdWrapper = document.getElementById("event-countdown"); /* The outer container  */


/* ====
   HELPER: pad
   Ensures a number is always displayed with at least 2 digits.
   e.g. pad(5) → "05",  pad(12) → "12"
   ==== */

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


/* ====
   CORE FUNCTION: updateCountdown
   Called once immediately and then every 1000 ms (1 second).
   Calculates the remaining time and updates the DOM.
   ==== */

function updateCountdown() {

    /* Date.now() — returns the current time as milliseconds since
       the Unix epoch (Jan 1 1970 UTC). This is the fastest way to
       get "right now" as a number.                    */
    const now = Date.now();

    /* EVENT_DATE.getTime() — same format (ms since epoch) for the
       target date. Subtracting gives us the gap in milliseconds.  */
    const diff = EVENT_DATE.getTime() - now;
    /* diff will be:
       - positive  → event is in the future (countdown running)
       - zero      → event is happening right now
       - negative  → event has already passed                    */


    /* ---- EVENT HAS PASSED ---- */
    if (diff <= 0) {
        /* The event is live or over — show a "LIVE NOW" message
           instead of the countdown blocks.                    */

        /* cdWrapper.classList.add("event-live") — adds the CSS class
           "event-live" to the countdown container. The CSS file uses
           this class to change the number colour to red.           */
        cdWrapper.classList.add("event-live");

        /* Set each number span to a special value */
        cdDays.textContent    = "00"; /* textContent sets the visible text of the element */
        cdHours.textContent   = "00";
        cdMinutes.textContent = "00";
        cdSeconds.textContent = "00";

        /* clearInterval(countdownIntervalId) — stops the setInterval timer
           so we don't keep running the function every second after
           the event has passed. countdownIntervalId is defined below.  */
        clearInterval(countdownIntervalId);

        /* Exit the function early — nothing more to calculate */
        return;
    }


    /* ---- CALCULATE TIME UNITS ---- */

    /* Math.floor(x) — rounds x DOWN to the nearest integer.
       We use it to convert milliseconds into whole seconds/minutes/etc. */

    /* Total whole seconds remaining */
    const totalSeconds = Math.floor(diff / 1000);
    /* ^ diff is in ms; dividing by 1000 gives seconds (with decimals);
       Math.floor removes the decimal part.                    */

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


/* ====
   INITIALISE
   Run the function once immediately so the timer shows correct
   values the instant the page loads (no 1-second blank delay).
   Then set it to run every 1000 ms (1 second) after that.
   ==== */

/* Only run the countdown if the countdown elements actually exist on this page.
   On the live-race page (launch-race-live.html) the countdown HTML is removed,
   so cdDays etc. are null. Without this guard, calling updateCountdown() would
   crash with "Cannot set properties of null" and silently stop ALL JS below it,
   including the race tracker, embers, and live timer.                          */
if (cdDays && cdHours && cdMinutes && cdSeconds && cdWrapper) {
    /* Call once right away */
    updateCountdown();

    /* setInterval(fn, ms) — calls fn repeatedly, every ms milliseconds.
       We store the return value (a numeric ID) in intervalId so we can
       cancel it with clearInterval() when the event has passed.        */
    const intervalId = setInterval(updateCountdown, 1000);
    /* ^ 1000 ms = 1 second                    */
}


/* ====
   RACE TRACKER — DATA + CONTROLLER
   This is the only section you need to edit on race day.
   ==== */

/**
 * raceData — update these values as the race progresses.
 * progress: how many of the 13 fights this runner has cleared (0–13)
 * deaths:   how many Pokémon this runner has lost so far
 */
const raceData = {
    kindle:       { progress: 0, deaths: 0 },
    flygonhg:     { progress: 0, deaths: 0 },
    kyacolosseum: { progress: 0, deaths: 0 },
    drayano:      { progress: 0, deaths: 0 },
    buhrito:      { progress: 0, deaths: 0 }
};

/**
 * updateRaceTracker()
 * Reads raceData and updates every token position and death count on the page.
 * Call this once on load — it will reflect whatever values are in raceData above.
 */
function updateRaceTracker() {
    // Loop over every runner key in raceData (kindle, flygonhg, etc.)
    for (const runner in raceData) {
        const data = raceData[runner]; // shorthand for this runner's { progress, deaths }

        // --- TOKEN POSITION ---
        // The ticks span from left:0 to right:30px inside .lane-track.
        // The finish flag sits in that last 30px gap.
        // If we set left:100% the token overshoots onto the flag.
        // Instead we measure the actual track element width at runtime and
        // subtract the 30px flag gap so progress=13 lands on the last tick,
        // not on the flag itself.
        const token = document.getElementById(`token-${runner}`);
        if (token) {
            const trackEl = token.closest('.lane-track'); // find the parent track div
            if (trackEl) {
                const trackWidth  = trackEl.offsetWidth;  // total pixel width of the track div
                const flagGap     = 30;                   // px reserved for the 🏁 flag on the right
                const tickZone    = trackWidth - flagGap; // pixel width where ticks actually live
                // Convert progress fraction to a pixel offset within the tick zone,
                // then express it as a % of the full track width so CSS `left` works correctly.
                // There are 14 ticks (positions 0–13). With space-between on 14 spans,
                // there are 13 gaps. progress=0 lands on tick 0 (far left),
                // progress=13 lands on tick 13 (far right / Norman).
                // Dividing by 13 correctly maps the 14-position range across the tick zone.
                const pxOffset    = (data.progress / 13) * tickZone;
                const pct         = (pxOffset / trackWidth) * 100;
                token.style.left  = `${pct}%`; // CSS transition handles the smooth slide
            }
        }

        // Update the small "3/13" label under the token
        const posLabel = document.getElementById(`pos-${runner}`);
        if (posLabel) {
            posLabel.textContent = `${data.progress}/13`; // e.g. "5/13"
        }

        // --- DEATH COUNT ---
        // Find the death count element for this runner (e.g. "deaths-kindle")
        const deathEl = document.getElementById(`deaths-${runner}`);
        if (deathEl) {
            const oldValue = parseInt(deathEl.textContent) || 0; // read the current displayed value
            deathEl.textContent = data.deaths;                    // update to the new value

            // If the death count increased, briefly add the "updated" class for a pop animation
            if (data.deaths > oldValue) {
                deathEl.classList.add('updated');           // triggers scale + colour flash in CSS
                setTimeout(() => {
                    deathEl.classList.remove('updated');    // remove after 300ms so it can fire again
                }, 300);
            }
        }
    }
}

/**
 * initTrackerEmbers()
 * Injects floating red ember particles into the .tracker-embers div.
 * This reuses the same particle logic as the index.html hero section.
 */
function initTrackerEmbers() {
    // Find the ember container div inside the race tracker module
    const container = document.getElementById('tracker-embers');
    if (!container) return; // If the element doesn't exist, do nothing

    const particleCount = 60; // Fewer particles than the hero (200) — subtler effect

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div'); // Create a new div for each particle

        // Apply all styles inline so this function is self-contained
        p.style.cssText = `
            position: absolute;
            width: ${2 + Math.random() * 3}px;   /* Random size between 2px and 5px */
            height: ${2 + Math.random() * 3}px;  /* Same random size (square → circle) */
            background-color: var(--accent-red);  /* Red ember colour */
            border-radius: 50%;                   /* Circular particle */
            opacity: 0;                    /* Start invisible — animation fades in */
            pointer-events: none;                 /* Clicks pass through */
            left: ${Math.random() * 100}%;        /* Random horizontal start position */
            bottom: -10px;                    /* Start just below the section */
            animation: ember-rise ${4 + Math.random() * 8}s   /* Random duration 4–12s */
                    ${Math.random() * 6}s                   /* Random delay 0–6s */
                    infinite linear;           /* Loop forever, constant speed */
        `;

        container.appendChild(p); // Add the particle to the ember container
    }

    // Inject the ember-rise keyframe animation into the page if it doesn't already exist.
    // We check for the id "tracker-ember-styles" to avoid duplicating the style tag.
    if (!document.getElementById('tracker-ember-styles')) {
        const style = document.createElement('style'); // Create a <style> element
        style.id = 'tracker-ember-styles';             // Give it an id so we can check for it
        style.textContent = `
            @keyframes ember-rise {
                0%   { transform: translateY(0)       rotate(0deg);   opacity: 0;   }
                10%  { opacity: 0.3; }    /* Fade in quickly after starting */
                90%  { opacity: 0.2; }    /* Stay faintly visible most of the way up */
                100% { transform: translateY(-900px)  rotate(360deg); opacity: 0; }
                /* -900px: rises far enough to clear the section height.
                   We use px instead of vh because the container has overflow:hidden —
                   vh would be clipped before the particle visibly moves.            */
            }
        `;
        document.head.appendChild(style); // Add the keyframes to the page's <head>
    }
}

/**
 * initLiveTimer()
 * Counts UP from the moment the page loads — shows how long the race has been running.
 * Updates every second.
 */
function initLiveTimer() {
    // Record the exact moment the page loaded as the "race start" reference point
    const startTime = Date.now(); // milliseconds since Unix epoch

    /**
     * tickLiveTimer()
     * Called every second. Calculates elapsed time and updates the h/m/s display.
     */
    function tickLiveTimer() {
        const elapsed = Date.now() - startTime; // total milliseconds elapsed since load

        // Break elapsed milliseconds into hours, minutes, seconds
        const totalSeconds = Math.floor(elapsed / 1000);          // convert ms to whole seconds
        const hours   = Math.floor(totalSeconds / 3600);          // 3600 seconds per hour
        const minutes = Math.floor((totalSeconds % 3600) / 60);   // remaining minutes
        const seconds = totalSeconds % 60;                    // remaining seconds

        // Helper: pad a number to always be 2 digits (e.g. 7 → "07")
        const pad = n => String(n).padStart(2, '0');

        // Update each number element in the live timer
        const hEl = document.getElementById('lt-hours');
        const mEl = document.getElementById('lt-minutes');
        const sEl = document.getElementById('lt-seconds');

        if (hEl) hEl.textContent = pad(hours);     // e.g. "01"
        if (mEl) mEl.textContent = pad(minutes);   // e.g. "23"
        if (sEl) sEl.textContent = pad(seconds);   // e.g. "07"
    }

    tickLiveTimer();                    // Run immediately so there's no blank flash on load
    setInterval(tickLiveTimer, 1000);       // Then update every 1000ms (1 second)
}

/* ====
   INITIALISE EVERYTHING ON PAGE LOAD
   ==== */
document.addEventListener('DOMContentLoaded', () => {
    initTrackerEmbers();   // Start the floating ember particles
    initLiveTimer();       // Start the elapsed race timer
    updateRaceTracker();   // Set all token positions and death counts from raceData
});