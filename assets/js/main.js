document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       1. IntersectionObserver Fallback & Reveal
       ========================================= */
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale, .reveal-fade').forEach(el => observer.observe(el));

    /* =========================================
       2. Dealers Interactive Accordion (Infinite Loop)
       ========================================= */
    const container = document.querySelector('.dealers-container');
    let dealerPanels = Array.from(document.querySelectorAll('.dealer-panel'));

    let currentIndex = 0;

    // Check if we are on desktop
    const isDesktopAccordion = () => window.innerWidth > 1024;

    const updateClasses = () => {
        if (!isDesktopAccordion()) return; // Don't apply layout classes on mobile
        dealerPanels.forEach((panel, i) => {
            panel.classList.remove('dp-1', 'dp-2', 'dp-3', 'dp-4', 'dp-hidden', 'active');

            const total = dealerPanels.length;
            const relPos = (i - currentIndex + total) % total;

            panel.style.order = relPos; // Force left-to-right order visually!

            if (relPos === 0) {
                panel.classList.add('dp-1', 'active');
            } else if (relPos === 1) {
                panel.classList.add('dp-2');
            } else if (relPos === 2) {
                panel.classList.add('dp-3');
            } else if (relPos === 3) {
                panel.classList.add('dp-4');
            } else {
                panel.classList.add('dp-hidden');
            }
        });
    };

    updateClasses();

    let isHoverRotating = false;

    const triggerAnimation = () => {
        isHoverRotating = true;
        updateClasses();
        setTimeout(() => isHoverRotating = false, 100);
    };

    const rotateNext = () => {
        if (!isDesktopAccordion()) return;
        currentIndex = (currentIndex + 1) % dealerPanels.length;
        triggerAnimation();
    };

    const rotatePrev = () => {
        if (!isDesktopAccordion()) return;
        currentIndex = (currentIndex - 1 + dealerPanels.length) % dealerPanels.length;
        triggerAnimation();
    };

    let autoRotate = setInterval(rotateNext, 4000);

    container.addEventListener('mouseenter', () => clearInterval(autoRotate));
    container.addEventListener('mouseleave', () => {
        clearInterval(autoRotate);
        autoRotate = setInterval(rotateNext, 4000);
    });

    // Handle hover and click
    dealerPanels.forEach((panel, i) => {
        const activatePanel = () => {
            if (isHoverRotating || currentIndex === i) return;

            clearInterval(autoRotate);
            currentIndex = i;
            triggerAnimation();
        };

        let hoverTimer;

        panel.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(activatePanel, 1000);
        });

        panel.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
        });

        // Restore click/tap if it wasn't a drag gesture
        panel.addEventListener('click', (e) => {
            if (!isDesktopAccordion()) return;
            if (Math.abs(startX - currentX) < 10) {
                activatePanel();
            }
        });

        // Drag / Swipe Variables
        panel.addEventListener('dragstart', (e) => e.preventDefault()); // Prevent ghosting
    });

    let startX = 0;
    let currentX = 0;
    let isDraggingGesture = false;

    const pointerDown = (e) => {
        if (!isDesktopAccordion()) return;
        isDraggingGesture = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = startX;
        container.style.cursor = 'grabbing';
        clearInterval(autoRotate);
    };

    const pointerMove = (e) => {
        if (!isDraggingGesture) return;
        currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    };

    const pointerUp = (e) => {
        if (!isDraggingGesture || !isDesktopAccordion()) return;
        isDraggingGesture = false;
        container.style.cursor = 'pointer';

        const diffX = startX - currentX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                rotateNext();
            } else {
                rotatePrev();
            }
        }
    };

    container.addEventListener('mousedown', pointerDown);
    container.addEventListener('touchstart', pointerDown, { passive: true });
    window.addEventListener('mousemove', pointerMove);
    window.addEventListener('touchmove', pointerMove, { passive: true });
    window.addEventListener('mouseup', pointerUp);
    window.addEventListener('touchend', pointerUp);

    // Trackpad swipe logic
    let accumulatedDelta = 0;
    let wheelTimeout;
    let isTrackpadScrolling = false;

    container.addEventListener('wheel', (e) => {
        if (!isDesktopAccordion()) return;

        // Only target horizontal scrolling
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault(); // Stop native back/forward swipe gesture

            if (isTrackpadScrolling) return; // Ignore residual inertia to prevent over-sliding

            clearInterval(autoRotate);
            accumulatedDelta += e.deltaX;

            // Lowered threshold to ensure even the softest trackpad swipes register immediately
            if (Math.abs(accumulatedDelta) > 20) {
                if (accumulatedDelta > 0) {
                    rotateNext();
                } else {
                    rotatePrev();
                }

                accumulatedDelta = 0;
                isTrackpadScrolling = true;

                // Block further triggers from this same physical swipe for 500ms
                setTimeout(() => isTrackpadScrolling = false, 500);
            }

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => accumulatedDelta = 0, 150);
        }
    }, { passive: false });

    /* =========================================
       3. Achievements Dynamic Slider (Dummy Data)
       ========================================= */
    const achievementsData = [
        {
            title: "Honda Wing World Dealers",
            desc: "The only Honda dealer in Kerala who has been selected by Honda<br>to join the Elite Club of Wing World Dealers. Ranked No.1 in Dealer<br>Customer Satisfaction Index in SouthIndia and No: 2 in All India.<br>(DCSI & BCSI Survey) 2014-2015.",
            image: "./assets/images/Award Ceremony.png"
        },
        {
            title: "National Outstanding Performance",
            desc: "Awarded for demonstrating exceptional sales growth and pioneering<br>service strategies across the entire southern market.<br>Setting a new benchmark for automotive excellence.<br>(National Automative Survey) 2018-2019.",
            image: "./assets/images/Award Ceremony.png"
        },
        {
            title: "Premium Dealer of the Year",
            desc: "Recognized internationally for maintaining the highest tier<br>of customer satisfaction and technical innovation.<br>A testament to our unwavering commitment to quality.<br>(Global Quality Index) 2021-2022.",
            image: "./assets/images/Award Ceremony.png"
        },
        {
            title: "Sustainability Champion Award",
            desc: "Honored for leading the transition towards greener operations<br>and establishing sustainable logistics pipelines in Kerala.<br>Paving the way for the future of environmentally conscious business.<br>2023-2024.",
            image: "./assets/images/Award Ceremony.png"
        }
    ];

    const dots = document.querySelectorAll('.achievement-dots .dot');
    const achieveTitle = document.querySelector('.achievement-heading');
    const achieveDesc = document.querySelector('.achievement-desc');
    const achieveImg = document.querySelector('.achievement-image-column img');

    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                document.querySelector('.achievement-dots .dot.active').classList.remove('active');
                dot.classList.add('active');

                // Fade out
                achieveTitle.style.opacity = '0';
                achieveDesc.style.opacity = '0';
                achieveImg.style.opacity = '0.5';
                achieveTitle.style.transform = 'translateY(10px)';
                achieveDesc.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    achieveTitle.innerHTML = achievementsData[index].title;
                    achieveDesc.innerHTML = achievementsData[index].desc;
                    achieveImg.src = achievementsData[index].image;

                    // Fade in
                    achieveTitle.style.opacity = '1';
                    achieveDesc.style.opacity = '1';
                    achieveImg.style.opacity = '1';
                    achieveTitle.style.transform = 'translateY(0)';
                    achieveDesc.style.transform = 'translateY(0)';
                }, 300);
            });
        });
    }

    /* =========================================
       4. Testimonials Advanced Carousel
       ========================================= */
    const testimonialsData = [
        {
            name: "Sujith Kammath",
            role: "BMW",
            review: "\"Being an Auto enthusiast the relation with EVM group made me the owner of almost be portfolio range includes cars motorad & mini\"",
            image: "./assets/images/testimonials/Sujith Kummath.png"
        },
        {
            name: "Remya Nambeesan",
            role: "MINI COOPER",
            review: "\"I recently purchased my first MINI from MINI EVM Autokraft. I loved the experience and would surely recommend it to others.\"",
            image: "./assets/images/testimonials/Remya nambeeshan.png"
        },
        {
            name: "Jeeva Joseph",
            role: "MG HECTOR",
            review: "\"Two good things happened last year. . I am using a top-end diesel variant with top-class performance with a satisfying 13 km/l mileage on the road. Thanks to Coastline Garages for helping me in choosing the better vehicle.\"",
            image: "./assets/images/testimonials/Jeeva Joseph.png"
        },
        {
            name: "Vivek Ajit",
            role: "MINI COOPER",
            review: "\"Our MINI is the 3rd car purchased from the EVM Autokraft dealership. This itself proves that their customer service is way beyond others. Really had a great experience. The MINI is a car that I always wanted to have in my garage and is a real pleasure to drive.\"",
            image: "./assets/images/testimonials/Vivek Ajith.png"
        },
        {
            name: "Lijo Augustin",
            role: "MG HECTOR",
            review: "\"The MG Hector is the best car. The seating comfortableness is technically very good and has fabulous interior and outer body design. It is a very rich looking and advanced technology at this price. Boot space is satisfied with my family and sunroof is also very satisfying.\"",
            image: "./assets/images/testimonials/Lijo Augustin.png"
        },
        {
            name: "Mr Jithin Jayakrishnan",
            role: "BMW",
            review: "\"The best customer-centric dealership I have ever dealt with happy to add The first BMW 840i in Kerala. Courteous staff and Management.\"",
            image: "./assets/images/testimonials/Mr Jithin JayaKrishnan.png"
        },
        {
            name: "Dr Sunil Sreedhar",
            role: "BMW",
            review: "\"Happy to Own the First New X6 M40i in kerala the relation with EVM Group for the past 4 to 5 years made me repeated purchases from the same group\"",
            image: "./assets/images/testimonials/Dr Sunil Sreedaran.png"
        },
        {
            name: "Josily Boban",
            role: "MINI COOPER",
            review: "\"Had a fantastic experience buying my MINI and I absolutely love the car. It really is a great city car.\"",
            image: "./assets/images/testimonials/Josly Boban.png"
        },
        {
            name: "Alfan Hassan",
            role: "MINI COOPER",
            review: "\"I wanted a MINI but one in which I could travel with my entire family. The MINI Countryman is a perfect choice. The staff at the MINI dealership made the entire buying experience cherishable.\"",
            image: "./assets/images/testimonials/Alfan Hassan.png"
        }
    ];

    let currentTestimonial = 0; // Starts at 0 (Sujith)
    let isAnimating = false;
    const btnPrev = document.querySelector('.t-prev');
    const btnNext = document.querySelector('.t-next');

    const mainImg = document.querySelector('.t-main-image img');
    const prevImg = document.querySelector('.t-prev img');
    const nextImg = document.querySelector('.t-next img');
    const testQuote = document.querySelector('.t-quote-text');
    const testName = document.querySelector('.t-name');
    const testRole = document.querySelector('.t-role');

    const updateTestimonial = (index, direction = 'next') => {
        if (!mainImg || isAnimating) return;
        isAnimating = true;

        const prevIndex = (index - 1 + testimonialsData.length) % testimonialsData.length;
        const nextIndex = (index + 1) % testimonialsData.length;

        const mainCard    = document.querySelector('.t-main-card');
        const origPrevImg = document.querySelector('.t-prev img');
        const origNextImg = document.querySelector('.t-next img');

        const slideOut = direction === 'next' ? '-24px' : '24px';
        const slideIn  = direction === 'next' ? '24px'  : '-24px';

        // — Step 1: fade the card OUT —
        const fadeOut = 'opacity 0.22s ease, transform 0.22s ease';
        mainCard.style.transition = fadeOut;
        mainCard.style.opacity    = '0';
        mainCard.style.transform  = `translateX(${slideOut})`;

        setTimeout(() => {
            // — Step 2: swap content while invisible —
            testQuote.textContent = testimonialsData[index].review;
            testName.textContent  = testimonialsData[index].name;
            testRole.textContent  = testimonialsData[index].role;
            mainImg.src           = testimonialsData[index].image;

            if (origPrevImg) origPrevImg.src = testimonialsData[prevIndex].image;
            if (origNextImg) origNextImg.src = testimonialsData[nextIndex].image;

            // reset to the opposite side instantly
            mainCard.style.transition = 'none';
            mainCard.style.transform  = `translateX(${slideIn})`;
            mainCard.style.opacity    = '0';

            void mainCard.offsetWidth; // force reflow

            // — Step 3: fade IN —
            mainCard.style.transition = 'opacity 0.30s ease, transform 0.30s cubic-bezier(0.16, 1, 0.3, 1)';
            mainCard.style.opacity    = '1';
            mainCard.style.transform  = 'translateX(0)';

            setTimeout(() => {
                mainCard.style.transition = '';
                isAnimating = false;
            }, 320);

        }, 230);
    };


    if (btnPrev && btnNext) {
        btnNext.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial + 1) % testimonialsData.length;
            updateTestimonial(currentTestimonial, 'next');
        });

        btnPrev.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial - 1 + testimonialsData.length) % testimonialsData.length;
            updateTestimonial(currentTestimonial, 'prev');
        });
    }

    /* 5. Timeline Continuous Diagonal Parallax (Removed for new slider design) */

    /* 6. History Cards Slider Logic & Drag to Swipe */
    const historyContainer = document.querySelector('.history-cards-container');
    const historyPrevBtn = document.querySelector('.history-nav.prev-btn');
    const historyNextBtn = document.querySelector('.history-nav.next-btn');

    if (historyContainer) {
        if (historyPrevBtn && historyNextBtn) {
            historyNextBtn.addEventListener('click', () => {
                historyContainer.scrollBy({ left: Math.min(window.innerWidth * 0.8, 480), behavior: 'smooth' });
            });

            historyPrevBtn.addEventListener('click', () => {
                historyContainer.scrollBy({ left: -Math.min(window.innerWidth * 0.8, 480), behavior: 'smooth' });
            });
        }

        // --- Mouse Drag (Swiping) Logic ---
        let isDown = false;
        let startX;
        let scrollLeft;

        // Prevent default drag behaviors on images (ghosting)
        const historyImages = historyContainer.querySelectorAll('img');
        historyImages.forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });

        historyContainer.style.cursor = 'grab';

        historyContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            historyContainer.style.cursor = 'grabbing';
            // Disable scroll snap for smooth 1:1 dragging
            historyContainer.style.scrollSnapType = 'none';
            // Disable smooth behavior to make drag instantaneous
            historyContainer.style.scrollBehavior = 'auto';

            startX = e.pageX - historyContainer.offsetLeft;
            scrollLeft = historyContainer.scrollLeft;
        });

        const resetGrabState = () => {
            if (!isDown) return;
            isDown = false;
            historyContainer.style.cursor = 'grab';
            historyContainer.style.scrollBehavior = 'smooth';
            historyContainer.style.scrollSnapType = 'x mandatory';
        };

        historyContainer.addEventListener('mouseleave', resetGrabState);
        historyContainer.addEventListener('mouseup', resetGrabState);

        historyContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - historyContainer.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier
            historyContainer.scrollLeft = scrollLeft - walk;
        });
    }

    /* =========================================
       13. Touch Swipe — Testimonials
       ========================================= */
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    if (testimonialCarousel) {
        let tSwipeStartX = 0;
        let tSwipeStartY = 0;

        testimonialCarousel.addEventListener('touchstart', (e) => {
            tSwipeStartX = e.touches[0].clientX;
            tSwipeStartY = e.touches[0].clientY;
        }, { passive: true });

        testimonialCarousel.addEventListener('touchend', (e) => {
            const dx = tSwipeStartX - e.changedTouches[0].clientX;
            const dy = tSwipeStartY - e.changedTouches[0].clientY;
            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

            if (dx > 0) {
                currentTestimonial = (currentTestimonial + 1) % testimonialsData.length;
                updateTestimonial(currentTestimonial, 'next');
            } else {
                currentTestimonial = (currentTestimonial - 1 + testimonialsData.length) % testimonialsData.length;
                updateTestimonial(currentTestimonial, 'prev');
            }
        }, { passive: true });
    }

    /* =========================================
       14. Touch Swipe — Awards / Achievements
       ========================================= */
    const awardDotsEl = document.getElementById('award-dots');
    if (awardDotsEl) {
        const allAwardDots = Array.from(awardDotsEl.querySelectorAll('.dot'));
        const totalAwards  = allAwardDots.length;
        let   aCurrentIdx  = 0;

        allAwardDots.forEach((dot, i) => {
            dot.addEventListener('click', () => { aCurrentIdx = i; });
        });

        const awardsSwipeEl = awardDotsEl.closest('section') || document.body;
        let aSwipeStartX = 0;
        let aSwipeStartY = 0;

        awardsSwipeEl.addEventListener('touchstart', (e) => {
            aSwipeStartX = e.touches[0].clientX;
            aSwipeStartY = e.touches[0].clientY;
        }, { passive: true });

        awardsSwipeEl.addEventListener('touchend', (e) => {
            const dx = aSwipeStartX - e.changedTouches[0].clientX;
            const dy = aSwipeStartY - e.changedTouches[0].clientY;
            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

            aCurrentIdx = dx > 0
                ? (aCurrentIdx + 1) % totalAwards
                : (aCurrentIdx - 1 + totalAwards) % totalAwards;

            if (allAwardDots[aCurrentIdx]) allAwardDots[aCurrentIdx].click();
        }, { passive: true });
    }

});


/* =========================================
   Dark Mode — Toggle & Init
   ========================================= */
function toggleDarkMode() {
    const html     = document.documentElement;
    const isDark   = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('evm-theme', newTheme);
}

document.addEventListener('DOMContentLoaded', function () {
    const headerBtn = document.getElementById('darkToggleBtn');
    if (headerBtn) headerBtn.addEventListener('click', toggleDarkMode);
});


/* =========================================
   7. Framer Smooth Scroll & Reveals
   ========================================= */
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('framer-in-view');
            observer.unobserve(entry.target);
        }
    });
}, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
});

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.framer-reveal');
    revealElements.forEach(el => revealObserver.observe(el));
});


/* =========================================
   8. 25th Anniversary Popup Logic
   ========================================= */


/* =========================================
   9. Awards Auto-Slider Gallery
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const awardsData = [
        {
            title: "Nissan Sales & Achievement",
            desc: "Executive Member of Nissan — Dealer core committee. Highest Nissan Sales All India. First Dealer in India to cross sales of 20,000 units.",
            img: "./assets/images/Awwards section/Nissan showroom.png"
        },
        {
            title: "Honda Wing World Dealers",
            desc: "The only Honda dealer in Kerala who has been selected by Honda to join the Elite Club of Wing World Dealers. Ranked No.1 in Dealer Customer Satisfaction Index in SouthIndia and No: 2 in All India. (DCSI & BCSI Survey) 2014-2015.",
            img: "./assets/images/Awwards section/Honda wing world.png"
        },
        {
            title: "Porsche Infrastructure",
            desc: "Set the benchmark for Porsche infrastructure in India.",
            img: "./assets/images/Awwards section/porshe showroom.png"
        },
        {
            title: "Porsche Deliveries",
            desc: "Delivered above 350 Porsche cars since inception. Delivered India’s first 2020 MY 911.",
            img: "./assets/images/Awwards section/Porshe 911 2020.png"
        },
        {
            title: "BMW Retail Excellence",
            desc: "Achieved annual retail targets in BMW since inception. 120% CBU achievement Including M760Li xDrive & X5M in 2018. Complaints per throughput were the lowest in the country in 2018. Manpower Availability 100% and Attrition of 0% in After-sales.",
            img: "./assets/images/Awwards section/BMW X-Drive.png"
        }
    ];

    const awardImg = document.getElementById('award-img');
    const awardTitle = document.getElementById('award-title');
    const awardDesc = document.getElementById('award-desc');
    const dotContainer = document.getElementById('award-dots');

    // Safety check
    if (!awardImg || !awardTitle || !awardDesc || !dotContainer) return;

    const dots = Array.from(dotContainer.querySelectorAll('.dot'));
    let currentIndex = 0;
    let slideTimer;

    // Fast-track CSS styling since classes natively exist
    [awardImg, awardTitle, awardDesc].forEach(el => {
        el.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
    });

    function renderAward(index) {
        // Fade out
        awardImg.style.opacity = '0';
        awardTitle.style.opacity = '0';
        awardDesc.style.opacity = '0';
        awardImg.style.transform = 'scale(1.02)';
        awardTitle.style.transform = 'translateY(15px)';
        awardDesc.style.transform = 'translateY(15px)';

        setTimeout(() => {
            // Update data
            awardImg.src = awardsData[index].img;
            awardTitle.innerHTML = awardsData[index].title;
            awardDesc.innerHTML = awardsData[index].desc;

            // Update Dots
            dots.forEach(d => d.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');

            // Fade in
            requestAnimationFrame(() => {
                awardImg.style.opacity = '1';
                awardTitle.style.opacity = '1';
                awardDesc.style.opacity = '1';
                awardImg.style.transform = 'scale(1)';
                awardTitle.style.transform = 'translateY(0)';
                awardDesc.style.transform = 'translateY(0)';
            });
        }, 500); // 500ms fade-out duration
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % awardsData.length;
        renderAward(currentIndex);
    }

    // Attach click events to dots synchronously 
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            if (currentIndex === idx) return; // Ignore if already active
            currentIndex = idx;
            renderAward(currentIndex);
            resetTimer(); // Reset the loop
        });
    });

    function resetTimer() {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 5000);
    }

    // Start Auto Rotate directly (first image already populated in DOM by default)
    resetTimer();
});


/* =========================================
   10. Mobile App Sidebar Engine
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn  = document.getElementById('mobileMenuBtn');
    const sidebar       = document.getElementById('mobileSidebar');
    const backdrop      = document.getElementById('sidebarBackdrop');
    const closeBtn      = document.getElementById('sidebarClose');
    const sectorsToggle = document.getElementById('msbSectors');
    const sectorsMenu   = document.getElementById('msbSectorsMenu');

    if (!hamburgerBtn || !sidebar || !backdrop) return;

    // ── Open & Close helpers ──────────────────────────────
    const openSidebar = () => {
        hamburgerBtn.classList.add('active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        sidebar.classList.add('open');
        sidebar.setAttribute('aria-hidden', 'false');
        backdrop.classList.add('open');
        document.body.classList.add('sidebar-open');
    };

    const closeSidebar = () => {
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        sidebar.classList.remove('open');
        sidebar.setAttribute('aria-hidden', 'true');
        backdrop.classList.remove('open');
        document.body.classList.remove('sidebar-open');
    };

    // ── Triggers ──────────────────────────────────────────
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    closeBtn && closeBtn.addEventListener('click', closeSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
    });

    // ── Sectors sub-menu toggle ───────────────────────────
    if (sectorsToggle && sectorsMenu) {
        sectorsToggle.addEventListener('click', () => {
            const isOpen = sectorsMenu.classList.contains('open');
            sectorsMenu.classList.toggle('open', !isOpen);
            sectorsToggle.classList.toggle('sub-open', !isOpen);
        });
    }

    // ── Active item highlight ─────────────────────────────
    document.querySelectorAll('.msb-nav-item[data-index]').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.msb-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            // Close sidebar after short delay for visual feedback
            setTimeout(closeSidebar, 220);
        });
    });
});

/* =========================================
   11. Floating Header Scroll Logic
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.querySelector('.site-header');
    if (!siteHeader) return;

    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add new pill style past 150px
        if (currentScrollY > 150) {
            siteHeader.classList.add('scrolled');
            
            if (currentScrollY > lastScrollY) {
                // Scrolling down -> hide header
                siteHeader.classList.add('hidden');
            } else {
                // Scrolling up -> show header
                siteHeader.classList.remove('hidden');
            }
        } else {
            // Near top -> revert to original hero header
            siteHeader.classList.remove('scrolled');
            siteHeader.classList.remove('hidden');
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });
});


/* =========================================
   12. Read More / Read Less Toggle
   ========================================= */
function toggleReadMore(expandedId, readMoreId) {
    const expanded = document.getElementById(expandedId);
    const readMoreBtn = document.getElementById(readMoreId);
    if (!expanded || !readMoreBtn) return;

    const isOpen = expanded.classList.contains('open');

    // Toggle expanded content
    expanded.classList.toggle('open', !isOpen);

    // Hide "Read more" when open, show when closed
    readMoreBtn.style.display = isOpen ? '' : 'none';

    // Toggle expanded class on the preview container (releases line-clamp)
    const parent = readMoreBtn.closest('.about-highlight, .about-text-right');
    if (parent) {
        parent.classList.toggle('expanded', !isOpen);
    }
}


/* =========================================
   15. Premium Hero Intro Orchestration
   Preloader (spinning wheel) → fades out → 25th content reveals.
   ========================================= */
(function heroIntroSequence() {
    const preloader = document.getElementById('evmPreloader');

    const PRELOADER_DISMISS  = 3300;  // ms: when to start fading preloader (premium animation needs 3.3s)
    const CONTENT_REVEAL_LAG = 350;   // ms after dismiss starts before content appears

    // ── Step 1: Dismiss preloader ──────────────────────────────────
    const dismissPreloader = () => {
        if (preloader) {
            preloader.classList.add('preloader-done');
            setTimeout(() => {
                if (preloader.parentNode) preloader.remove();
            }, 1000);
        }
    };

    // ── Step 2: Reveal 25th anniversary hero content ───────────────
    const revealHeroContent = () => {
        document.querySelectorAll('.hero-intro-reveal, .hero-25-reveal')
            .forEach(el => el.classList.add('hero-visible'));
    };

    // ── Sequence ──────────────────────────────────────────────────
    // Timeline:
    //   0ms        → page loads, wheel spinning in preloader
    //   2300ms     → preloader starts fading (0.9s fade)
    //   2700ms     → 25th anniversary content fades in
    setTimeout(dismissPreloader, PRELOADER_DISMISS);
    setTimeout(revealHeroContent, PRELOADER_DISMISS + CONTENT_REVEAL_LAG);
})();

/* =========================================
   16. Count-Up Number Animation
   Triggers when stat numbers scroll into view.
   ========================================= */
(function initCountUp() {
    const counters = document.querySelectorAll('.count-up[data-count]');
    if (!counters.length) return;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el) => {
        const target   = parseFloat(el.dataset.count);
        const suffix   = el.dataset.suffix || '';
        const isDecimal = !Number.isInteger(target);
        const duration = 1800; // ms
        let startTime  = null;

        el.classList.add('counting');

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed  = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedVal = easeOut(progress) * target;

            el.textContent = isDecimal
                ? easedVal.toFixed(1) + suffix
                : Math.round(easedVal) + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
                el.classList.remove('counting');
            }
        };

        requestAnimationFrame(step);
    };

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    counters.forEach(el => countObserver.observe(el));
})();
