/* Atlas — runtime fix for the phantom blank space that some in-app / iOS
   browsers (notably Chrome on iOS) leave below the footer AFTER the native
   App Store sheet is dismissed. Tapping a Download link opens that sheet over
   the page; returning from it can inflate the scrollable area, leaving a large
   empty gap under the footer.

   The fix waits for the page to regain focus/visibility, checks whether a real
   gap has appeared, and if so forces a synchronous layout reflow to collapse it.
   The reflow is structured so the hidden state is never painted (display is
   restored before the browser paints), so there is no visible flash, and it
   only runs when an actual gap is detected. */
(function () {
  function gapBelowFooter() {
    var f = document.querySelector('footer');
    if (!f) return 0;
    var bottom = f.getBoundingClientRect().bottom + (window.pageYOffset || 0);
    return (document.documentElement.scrollHeight || 0) - bottom;
  }

  function collapseGap() {
    if (gapBelowFooter() <= 2) return;          // nothing wrong — leave the page alone
    var b = document.body, y = window.pageYOffset || 0;
    b.style.display = 'none';
    void b.offsetHeight;                         // force reflow while hidden (no paint yet)
    b.style.display = '';                        // restored before any paint -> no flash
    window.scrollTo(0, y);                       // keep the scroll position steady
  }

  var t;
  function schedule() { clearTimeout(t); t = setTimeout(collapseGap, 60); }

  document.addEventListener('visibilitychange', function () { if (!document.hidden) schedule(); });
  window.addEventListener('focus', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('resize', schedule);
})();
