/* Face by Sumona - build social share links for the current page.
   Facebook + Pinterest use their official share intents.
   Instagram has no public web share URL, so on touch devices we hand off to
   the native share sheet (which surfaces Instagram) and elsewhere we copy the
   link so it can be pasted into an Instagram post or story. */
(function () {
  var canonical = document.querySelector('link[rel="canonical"]');
  var pageUrl = (canonical && canonical.href) || window.location.href;

  var ogImage = document.querySelector('meta[property="og:image"]');
  var imageUrl = ogImage ? ogImage.content : '';

  var ogTitle = document.querySelector('meta[property="og:title"]');
  var title = ogTitle ? ogTitle.content : document.title;

  var enc = encodeURIComponent;

  var fb = document.querySelector('.fbs-share-fb');
  if (fb) {
    fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + enc(pageUrl);
  }

  var pin = document.querySelector('.fbs-share-pin');
  if (pin) {
    pin.href = 'https://pinterest.com/pin/create/button/?url=' + enc(pageUrl) +
      (imageUrl ? '&media=' + enc(imageUrl) : '') +
      '&description=' + enc(title);
  }

  var ig = document.querySelector('.fbs-share-ig');
  var status = document.querySelector('.fbs-share-status');
  var showStatus = function (msg) {
    if (status) {
      status.textContent = msg;
      window.setTimeout(function () { status.textContent = ''; }, 6000);
    }
  };

  if (ig) {
    ig.addEventListener('click', function () {
      var coarse = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

      if (coarse && navigator.share) {
        navigator.share({ title: title, text: title, url: pageUrl }).catch(function () {});
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pageUrl).then(function () {
          showStatus('Link copied. Open Instagram and paste it into your post or story.');
        }).catch(function () {
          showStatus('Copy this link: ' + pageUrl);
        });
      } else {
        showStatus('Copy this link: ' + pageUrl);
      }
    });
  }
})();
