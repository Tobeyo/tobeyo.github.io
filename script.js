/**
 * Portfolio Website JavaScript
 * Vanilla ES6+ for lightweight interactivity
 */

// ===================================
// DOM Elements
// ===================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// ===================================
// Mobile Navigation Toggle
// ===================================
function toggleMobileNav() {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

// Close mobile nav when clicking a link
function closeMobileNav() {
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
}

navToggle.addEventListener('click', toggleMobileNav);

navLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
});

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !navToggle.contains(e.target)) {
        closeMobileNav();
    }
});

// ===================================
// Navbar Scroll Effect
// ===================================
let lastScrollY = window.scrollY;

function handleNavbarScroll() {
    const currentScrollY = window.scrollY;
    
    // Add scrolled class when scrolled past 50px
    if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollY = currentScrollY;
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// ===================================
// Active Navigation Link Highlighting
// ===================================
const sections = document.querySelectorAll('section[id]');

function highlightActiveNavLink() {
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightActiveNavLink, { passive: true });

// ===================================
// Fade-in Animation on Scroll
// ===================================
const fadeElements = document.querySelectorAll('.skill-card, .about-content, .contact-content');

function initFadeInElements() {
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
    });
}

function handleFadeInOnScroll() {
    fadeElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            el.classList.add('visible');
        }
    });
}

// Initialize fade elements and check on scroll
initFadeInElements();
window.addEventListener('scroll', handleFadeInOnScroll, { passive: true });
// Initial check for elements already in view
handleFadeInOnScroll();

// ===================================
// Smooth Scroll for Anchor Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Keyboard Accessibility
// ===================================
// Close mobile nav with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMobileNav();
    }
});

// ===================================
// Console Easter Egg
// ===================================
console.log('%c👋 Hey there, fellow developer!', 'font-size: 16px; font-weight: bold;');
console.log('%cInterested in the code? Check out the repo!', 'font-size: 14px;');
console.log('%chttps://github.com/tobeyo/tobeyo.github.io', 'font-size: 12px; color: #4a9e9e;');
