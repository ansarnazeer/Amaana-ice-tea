/* =========================================================================
   AMAANA — sections.js
   Scroll-driven hero progress + buttery IntersectionObserver reveals
   ========================================================================= */

/* ── Hero scroll progress (passed to the Three.js scene) ── */
(function () {
  const wrapper = document.getElementById('hero-pin-wrapper');
  if (!wrapper) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    ticking = false;
    const rect = wrapper.getBoundingClientRect();
    const totalScroll = wrapper.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalScroll));

    if (window.__amaanaUpdateScene) {
      window.__amaanaUpdateScene(progress);
    }

    /* Fade out scroll hint */
    const hint = document.querySelector('.scroll-hint');
    if (hint) {
      const hintOpacity = Math.max(0, 1 - progress * 6);
      hint.style.setProperty('--hint-opacity', hintOpacity);
    }

    /* Fade in hero copy */
    const copyOpacity = Math.max(0, Math.min(1, (progress - 0.55) / 0.3));
    const copyShift = (1 - copyOpacity) * 14;
    const sticky = document.getElementById('hero-sticky');
    if (sticky) {
      sticky.style.setProperty('--copy-opacity', copyOpacity);
      sticky.style.setProperty('--copy-shift', copyShift + 'px');
    }

    /* Stage frame corners */
    const frameOpacity = Math.min(1, Math.max(0, (progress - 0.1) / 0.3));
    const sticky2 = document.getElementById('hero-sticky');
    if (sticky2) sticky2.style.setProperty('--frame-opacity', frameOpacity);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

/* ── Hamburger menu toggle ── */
(function () {
  const btn = document.getElementById('nav-menu-btn');
  const overlay = document.getElementById('menu-overlay');
  if (!btn || !overlay) return;

  btn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open);
  });

  overlay.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();

/* ── IntersectionObserver for .reveal-fade elements ── */
(function () {
  const els = document.querySelectorAll('.reveal-fade');
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08,
    }
  );

  els.forEach((el) => io.observe(el));
})();

/* ── Why Choose Us scroll story ── */
(function () {

  const section =
    document.getElementById('basics-section');

  if (!section) return;

  const features =
    section.querySelectorAll('.basics-feature');

  const dots =
    section.querySelectorAll('.basics-dot');

  if (!features.length || !dots.length) return;

  /* The section keeps its 500vh scroll-jack height at every viewport width
     (see sections.css), so the same pinned, one-card-at-a-time story now
     runs on mobile too — just at a smaller visual size. */

  let activeIndex = 0;


  function setActive(index) {

    if (index === activeIndex) return;

    activeIndex = index;

    features.forEach((feature, i) => {

      feature.classList.toggle(
        'active',
        i === index
      );

    });

    dots.forEach((dot, i) => {

      dot.classList.toggle(
        'active',
        i === index
      );

    });

  }


  function update() {

    const rect =
      section.getBoundingClientRect();

    const viewportHeight =
      window.innerHeight;


    /*
      How far we have travelled
      through this section.
    */

    const scrollDistance =
      section.offsetHeight -
      viewportHeight;


    if (scrollDistance <= 0) return;


    let progress =
      -rect.top /
      scrollDistance;


    progress =
      Math.max(
        0,
        Math.min(1, progress)
      );


    /*
      Five pieces of content
      = five scroll positions.
    */

    const index =
      Math.min(
        features.length - 1,
        Math.floor(
          progress * features.length
        )
      );


    setActive(index);

  }


  let storyTicking = false;
  function onStoryScroll() {
    if (!storyTicking) {
      storyTicking = true;
      requestAnimationFrame(() => {
        storyTicking = false;
        update();
      });
    }
  }

  window.addEventListener(
    'scroll',
    onStoryScroll,
    { passive: true }
  );


  window.addEventListener(
    'resize',
    update
  );


  /* Clickable dots */

  dots.forEach((dot, index) => {

    dot.addEventListener(
      'click',
      () => {

        const sectionTop =
          window.scrollY +
          section.getBoundingClientRect().top;


        const scrollDistance =
          section.offsetHeight -
          window.innerHeight;


        const progress =
          index /
          features.length;


        window.scrollTo({

          top:
            sectionTop +
            progress *
            scrollDistance,

          behavior: 'smooth'

        });

      }
    );

  });


  update();

})();

/* ── Availability accordion ── */
(function () {

  const items = document.querySelectorAll('.availability-item');

  if (!items.length) return;

  items.forEach((item) => {

    const trigger = item.querySelector('.availability-trigger');

    if (!trigger) return;

    trigger.addEventListener('click', () => {

      const isOpen = item.classList.contains('is-open');

      /* Close every other row */
      items.forEach((otherItem) => {

        otherItem.classList.remove('is-open');

        const otherTrigger =
          otherItem.querySelector('.availability-trigger');

        if (otherTrigger) {
          otherTrigger.setAttribute(
            'aria-expanded',
            'false'
          );
        }

      });

      /* Open clicked row */
      if (!isOpen) {

        item.classList.add('is-open');

        trigger.setAttribute(
          'aria-expanded',
          'true'
        );

      }

    });

  });

})();

/* ── Contact form — Formspree AJAX ── */
(function () {
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('submit-btn');

  if (!form || !btn) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        form.reset();

        btn.textContent = 'Message Sent ✓';

        setTimeout(function () {
          btn.textContent = 'Send Message';
          btn.disabled = false;
        }, 4000);

      } else {
        throw new Error('Submission failed');
      }

    } catch (error) {
      btn.textContent = 'Something Went Wrong';

      setTimeout(function () {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 3000);
    }
  });
})();

/* =========================================================================
   AMAANA — PAGE LOADER
   ========================================================================= */

(() => {

  const loader = document.getElementById('page-loader');

  if (!loader) return;

  document.body.classList.add('loader-active');

  const openLoader = () => {

    // Start opening animation
    loader.classList.add('is-loaded');

    

    // Completely remove loader after animation
    setTimeout(() => {

      loader.remove();

      document.body.classList.remove('loader-active');

    }, 1250);

  };

  // Wait for the page and assets to become ready
  window.addEventListener('load', () => {

    setTimeout(openLoader, 350);

  });

})();