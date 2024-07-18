var Webflow = window.Webflow || [];
Webflow.push(() => {
  document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo(0, 0);
  });
  //Function to reset Webflow integrations
  function resetWebflow(data) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(data.next.html, "text/html");
    let webflowPageId = $(dom).find("html").attr("data-wf-page");
    $("html").attr("data-wf-page", webflowPageId);
    window.Webflow && window.Webflow.destroy();
    window.Webflow && window.Webflow.ready();
    window.Webflow && window.Webflow.require("ix2").init();
    document.dispatchEvent(new Event("readystatechange"));
  }

  barba.use(barba.prefetch);
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  let smoother;

  const animationEnter = (container) => {
    return gsap.from(container, {
      opacity: 0,
      duration: 0.5,
    });
  };

  const animationLeave = (container) => {
    return gsap
      .to(container, {
        opacity: 0,
        duration: 0.5,
      })
      .then(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
        console.log("did it work?");
      });
  };

  const initializeScrollSmoother = () => {
    if (ScrollSmoother) {
      console.log("Initializing ScrollSmoother...");

      const mm = gsap.matchMedia();

      // Add a media query. When it matches, the associated function will run
      mm.add("(min-width: 800px)", () => {
        const smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1, // Adjust the smoothness as needed
          smoothTouch: 0, // Disable smooth scrolling on touch devices
          effects: true,
        });

        console.log("ScrollSmoother initialized");
      });
    } else {
      console.error("ScrollSmoother not found");
    }
  };

  const animateNavigation = () => {
    const nav = document.querySelector("[data-fixed-nav]");
    return gsap.from(nav, { y: -100, opacity: 0, duration: 1 });
  };

  /// Projects Toggle

  $(".view-button").on("click", function () {
    $(this).toggleClass("pressed");

    // Capture the initial state of elements
    const stateBefore = Flip.getState(
      ".image_container, .project_column_1, .project_column_4, .project_column_3"
    );

    // Toggle class for list view
    $(".projects_list").toggleClass("list-view");
    $(".projects_flex_item").toggleClass("list-view");
    $(".image_container").toggleClass("list-view");

    // Force reflow to ensure styles are recalculated
    document.querySelector(".projects_list").offsetHeight;
    document.querySelector(".image_container").offsetHeight;
    document.querySelector(".projects_flex_item").offsetHeight;

    // Capture the final state after toggling
    const stateAfter = Flip.getState(
      ".image_container, .project_column_1, .project_column_4, .project_column_3"
    );

    // Animate from the initial state to the final state
    Flip.from(stateBefore, {
      duration: 0.5,
      nested: true,
      ease: "power1.inOut",
    });

    // Ensure the font size animates smoothly
    gsap.to(".projects_flex h1", {
      fontSize: $(".projects_list").hasClass("list-view")
        ? "newFontSize"
        : "originalFontSize",
      duration: 0.5,
      ease: "power1.inOut",
      onComplete: () => {
        Flip.fit(".projects_flex h1", ".projects_flex h1");
      },
    });
  });

  // Function to disable scrolling
const disableScroll = () => {
  if (smoother) {
    smoother.paused(true);
    console.log("Scrolling disabled");
  } else {
    console.error("ScrollSmoother not initialized");
  }
  document.body.style.overflow = 'hidden'; // Disable native scrolling
};
  // Function to enable scrolling
  function enableScroll() {
    $("body").css("overflow", "");
  }

  /// Homepage Load Once
  function heroAnimation(heroWrap) {
    console.log("hero animation started");
    $("html").addClass("webflow-loaded");
    let heroMask = heroWrap.querySelector(".hero_mask");
    let heroImg = heroWrap.querySelector(".hero_img");
    let heroHeader = document.querySelector("[hero-header]");
    let nav = document.querySelector("[data-fixed-nav]");
    const navbg = document.querySelector("[data-fixed-navbg]");

    gsap.set(heroImg, { scale: 1.2 });
    gsap.set(navbg, { height: "0%" });

    return new Promise((resolve) => {
      let tl = gsap.timeline({
        defaults: { duration: 1, ease: "power2.inOut" },
        onStart: disableScroll,
        onUpdate: function () {
          if (tl.progress() >= 0.65) {
            enableScroll();
          }
        },
        onComplete: () => {
          enableScroll();
          resolve();
        },
      });

      tl.set(nav, { opacity: 0, y: -50 });
      tl.set(heroHeader, { opacity: 0, y: 50 });

      // Set initial states
      tl.set(heroMask, { opacity: 1 });

      // Animate elements
      tl.from(heroMask, { y: "100vh" });
      tl.from(heroImg, { y: "-100vh" }, "<");
      tl.fromTo(
        heroMask,
        { clipPath: "inset(calc(50% - 10vw) calc(50% - 20vw) round .5rem)" },
        { clipPath: "inset(calc(0% - 0vw) calc(0% - 0vw) round 0rem)" }
      );

      // Scaling animation for heroImg
      tl.to(heroImg, { scale: 1, duration: 1, ease: "power3.inOut" }, "-=1");
      // Animate navigation after hero elements
      gsap.to(
        [nav, heroHeader],
        { y: 0, opacity: 1, duration: 0.75, ease: "power2.inOut" },
        "-=0.5"
      );
    });
  }

  const initializeNavAnimations = () => {
    // Identify the fixed navigation element
    const nav = document.querySelector("[data-fixed-nav]");
    const navbg = document.querySelector("[data-fixed-navbg]");

    if (nav && navbg) {
      // Initial setup to set navbg height to 0 using gsap.set
      gsap.set(navbg, { height: "0%" });

      // Set up the ScrollTrigger for height animations
      ScrollTrigger.create({
        start: "top+=400 top", // Trigger when the top of the viewport hits the top of the page
        end: "bottom top", // Trigger when the bottom of the viewport hits the top of the page
        onEnter: () => {
          nav.setAttribute("data-theme", "light-nav"); // Change to 'light' when scrolling down
          gsap.to(navbg, { height: "100%", duration: 0.5, ease: "power3.out" }); // Animate height to 100%
        },
        onLeaveBack: () => {
          nav.setAttribute("data-theme", "dark-nav"); // Change to 'dark-nav' when scrolling back to the top
          gsap.to(navbg, { height: "0%", duration: 0.5, ease: "power3.out" }); // Animate height to 0%
        },
        onLeave: () => {
          nav.setAttribute("data-theme", "light-nav"); // Change to 'light' when scrolling down past the start point
          gsap.to(navbg, { height: "100%", duration: 0.5, ease: "power3.out" }); // Ensure height remains at 100%
        },
        onEnterBack: () => {
          nav.setAttribute("data-theme", "dark-nav"); // Change to 'dark-nav' when scrolling back to the start point
          gsap.to(navbg, { height: "0%", duration: 0.5, ease: "power3.out" }); // Ensure height remains at 0%
        },
      });

      // Set up a separate ScrollTrigger for hiding/showing the nav based on scroll direction
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (self.direction === 1) {
            // Scrolling down
            gsap.to(nav, { y: "-100%", duration: 1, ease: "power3.out" });
          } else if (self.direction === -1) {
            // Scrolling up
            gsap.to(nav, { y: "0%", duration: 1, ease: "power3.out" });
          }
        },
      });
    }
  };

  // Menu animation

  $(".nav_wrap").each(function () {
    let hamburgerEl = $(this).find(".nav_hamburger_wrap");
    console.log("hamburgerEl found:", hamburgerEl.length > 0);

    let navLineEl = $(this).find(".nav_hamburger_line");
    console.log("navLineEl found:", navLineEl.length > 0);

    let navItemEl = $(this).find(".nav_item");
    console.log("navItemEl found:", navItemEl.length > 0);

    let menuWrapEl = $(this).find(".menu_wrap");
    console.log("menuWrapEl found:", menuWrapEl.length > 0);

    let menuLinkEl = $(this).find(".menu_link");
    console.log("menuLinkEl found:", menuLinkEl.length > 0);

    let menuItemEl = $(this).find(".menu_item");
    console.log("menuItemEl found:", menuItemEl.length > 0);

    let navHamburgerWrap = $(this).find(".nav_hamburger_wrap");
    console.log("navHamburgerWrap found:", navHamburgerWrap.length > 0);

    let flipDuration = 0.4;
    let tl = gsap.timeline({ paused: true });
    let nav = document.querySelector("[data-fixed-nav]");

    tl.set(menuWrapEl, { display: "block" })
      .from(menuWrapEl, {
        height: "0vh",
        duration: 0.75,
        ease: "power3.out",
      })
      .from(
        [menuLinkEl, menuItemEl],
        {
          opacity: 0,
          y: 15,
          stagger: { amount: 0.35 },
          duration: 0.75,
          ease: "power3.out",
        },
        flipDuration
      );

    let originalTheme;

    function openMenu() {
      // Store the original theme
      originalTheme = nav.getAttribute("data-theme");
      disableScroll();

      
      nav.setAttribute("data-theme", "light-nav");
      hamburgerEl.addClass("nav-open");
      gsap.to(navLineEl.eq(0), { y: 4, rotate: 45, duration: flipDuration });
      gsap.to(navLineEl.eq(1), {
        y: -4,
        rotate: -45,
        duration: flipDuration,
      });
      tl.timeScale(1).play();
      
    }

    function closeMenu() {
      hamburgerEl.removeClass("nav-open");

      // Reverse the animations for the hamburger lines
      gsap.to(navLineEl.eq(0), { y: 0, rotate: 0, duration: flipDuration });
      gsap.to(navLineEl.eq(1), {
        y: 0,
        rotate: 0,
        duration: flipDuration,
        onComplete: () => {
          // Revert to the original theme
          nav.setAttribute("data-theme", originalTheme);

          // Enable scrolling when everything else is done
         enableScroll(); 
        },
        
      });

      // Reverse the menu timeline
      tl.timeScale(2).reverse();
    }

    // Event handler for click/touchstart on the hamburger icon
    hamburgerEl.on("click touchstart", function (e) {
      e.preventDefault();
      if (!hamburgerEl.hasClass("nav-open")) {
        openMenu();
        console.log("opening menu");
      } else {
        closeMenu();
      }
    });

    // Escape key event handler
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && hamburgerEl.hasClass("nav-open")) {
        closeMenu();
      }
    });

    // Event handler to close the menu when clicking outside of it
    $(document).on("click", function (e) {
      if (
        hamburgerEl.hasClass("nav-open") &&
        !$(e.target).closest(".nav_wrap").length
      ) {
        closeMenu();
      }
    });
  });

  ////**  BARBA TRANSITIONS  **////

  barba.init({
    transitions: [
      {
        once({ next }) {
          console.log("once");
          window.scrollTo(0, 0);
          heroAnimation(next.container).then(() => {
            initializeNavAnimations();
            initializeScrollSmoother();
            resetWebflow({ next });
            initializeCursor();
          });
        },
        leave({ current }) {
          console.log("leaving");
          if (smoother) {
            smoother.kill();
            smoother = null;
          }
          return animationLeave(current.container);
        },
        enter({ next }) {
          console.log("entering");
          window.scrollTo(0, 0);
          animationEnter(next.container).then(() => {
            initializeScrollSmoother();
            resetWebflow({ next });
            initializeCursor();
          });
        },
      },
    ],
  });
});
