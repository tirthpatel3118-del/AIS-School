document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavOverlay.classList.toggle('active');
            const spans = mobileMenuBtn.querySelectorAll('span');
            if (mobileNavOverlay.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close mobile nav when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavOverlay.classList.remove('active');
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal Animation (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Optional: stop observing once animated
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 4. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });


    // 6. Dynamic Notices via Google Sheets CSV
    const dynamicNotices = document.getElementById('dynamicNotices');
    if (dynamicNotices) {
        const sheetCSVUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRgF2Upcqxjp191z7ZJxxn5I0vQDUqZermn3i78y_l_8EXiVAto2QQ69eS8dW4wEm93RrqhBocdTcHY/pub?output=csv';
        
        // Fetch the CSV
        fetch(sheetCSVUrl)
            .then(response => response.text())
            .then(csvText => {
                // Parse CSV (Simple split by newline, ignoring empty rows)
                const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== '');
                
                if (rows.length === 0) {
                    dynamicNotices.innerHTML = '<span class="notice-item">🔔 Welcome to Anand International School! Stay tuned for more updates.</span>';
                    return;
                }

                // Clear loading text
                dynamicNotices.innerHTML = '';
                
                // Add each row as a notice item
                rows.forEach(row => {
                    // Remove wrapping quotes if they exist from CSV formatting
                    const cleanText = row.replace(/^"(.*)"$/, '$1');
                    const span = document.createElement('span');
                    span.className = 'notice-item';
                    span.textContent = '📢 ' + cleanText;
                    dynamicNotices.appendChild(span);
                });
                
                // Duplicate notices to create a seamless infinite scrolling loop effect
                const clone = dynamicNotices.innerHTML;
                dynamicNotices.innerHTML += clone;

            })
            .catch(error => {
                console.error("Error fetching notices:", error);
                dynamicNotices.innerHTML = '<span class="notice-item">🔔 Welcome to Anand International School!</span>';
            });
    }

    // 7. Modals Background Click to Close
    const videoModal = document.getElementById('videoModal');
    if(videoModal) {
        videoModal.addEventListener('click', (e) => {
            if(e.target === videoModal) closeVideoModal();
        });
    }

    const lightboxModal = document.getElementById('lightboxModal');
    if(lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if(e.target === lightboxModal) closeLightbox();
        });
    }
});

// Chatbot Functions (Global Scope for inline onclick)
function toggleChat() {
    const chatWindow = document.getElementById('chatbot');
    chatWindow.classList.toggle('active');
    
    // Auto-generate quick reply chips when chat opens
    if (chatWindow.classList.contains('active')) {
        const chatMsgs = document.getElementById('chatMessages');
        if (chatMsgs && !document.querySelector('.chat-chips')) {
            const chipsDiv = document.createElement('div');
            chipsDiv.className = 'chat-chips';
            chipsDiv.style.display = 'flex';
            chipsDiv.style.gap = '8px';
            chipsDiv.style.flexWrap = 'wrap';
            chipsDiv.style.marginTop = '10px';
            
            ['Admissions', 'Fees', 'Timing', 'Contact'].forEach(text => {
                const btn = document.createElement('button');
                btn.textContent = text;
                btn.style.padding = '6px 12px';
                btn.style.borderRadius = '15px';
                btn.style.border = '1px solid var(--clr-primary)';
                btn.style.background = 'var(--clr-white)';
                btn.style.color = 'var(--clr-primary)';
                btn.style.cursor = 'pointer';
                btn.style.fontSize = '0.8rem';
                btn.onclick = () => {
                     document.getElementById('chatInput').value = text;
                     sendChatMessage();
                     chipsDiv.style.display = 'none'; // hide chips after use
                };
                chipsDiv.appendChild(btn);
            });
            chatMsgs.appendChild(chipsDiv);
        }
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message === '') return;
    
    const chatMessages = document.getElementById('chatMessages');
    
    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = message;
    chatMessages.appendChild(userDiv);
    
    // Clear input
    input.value = '';
    
    // Auto scroll bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate Bot response (Basic fuzzy logic stub)
    setTimeout(() => {
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot';
        
        const lowerMsg = message.toLowerCase();
        let reply = "I'm sorry, I didn't quite catch that. Could you try rephrasing, or contact us at aischool210@gmail.com?";
        
        if (lowerMsg.includes('admissions') || lowerMsg.includes('apply') || lowerMsg.includes('join')) {
            reply = "You can apply for admission by filling out the Inquiry Form on our website. Applications for 2026-27 are now open. Would you like me to guide you to the Admissions section? Alternatively, you can call us directly.";
        } else if (lowerMsg.includes('fee') || lowerMsg.includes('cost') || lowerMsg.includes('tuition')) {
            reply = "Tuition fees vary by grade level and stream (for Std 11-12). Please contact our administrative office (+91 70465 49656) for a detailed fee structure tailored to your child.";
        } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
            reply = "Hello! Welcome to Anand International School's virtual assistant. Try asking me about 'admissions', 'fees', 'timing', 'location', or 'academics'.";
        } else if (lowerMsg.includes('time') || lowerMsg.includes('timing') || lowerMsg.includes('hours') || lowerMsg.includes('open')) {
            reply = "Our regular school hours are from 8:00 AM to 3:00 PM, Monday through Friday. Extracurriculars run from 3:15 PM to 5:00 PM.";
        } else if (lowerMsg.includes('location') || lowerMsg.includes('where') || lowerMsg.includes('address')) {
            reply = "We are located at NH-8, Opp. amul chocolate plant, mogar, anand -388001. You can find a Google Map to our campus at the bottom of the page.";
        } else if (lowerMsg.includes('academic') || lowerMsg.includes('syllabus') || lowerMsg.includes('board') || lowerMsg.includes('standard')) {
            reply = "We offer programs from Pre-Primary through Std 12. Our secondary and higher secondary sections follow the rigorous GSEB board curriculum. Visit our Academics page for more details.";
        } else if (lowerMsg.includes('activities') || lowerMsg.includes('sports') || lowerMsg.includes('arts') || lowerMsg.includes('extracurricular')) {
            reply = "We believe in holistic development! We offer 15+ varsity sports, Fine Arts clubs, and STEM & Robotics labs. Checkout our Student Life page.";
        } else if (lowerMsg.includes('contact') || lowerMsg.includes('call') || lowerMsg.includes('phone') || lowerMsg.includes('email')) {
            reply = "You can reach us directly at +91 70465 49656 or email us at aischool210@gmail.com. We'd be happy to speak with you!";
        }

        botDiv.textContent = reply;
        chatMessages.appendChild(botDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

function handleChat(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Virtual Tour & Gallery Functions
function openVideoModal() {
    const modal = document.getElementById('videoModal');
    if (modal) modal.classList.add('active');
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.classList.remove('active');
        // Stop the video by reloading the iframe src
        const iframe = document.getElementById('tourVideo');
        if (iframe) {
            const src = iframe.src;
            iframe.src = src; 
        }
    }
}

function openLightbox(element) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    
    if (modal && img) {
        // Extract background image url from the clicked element
        const bgStyle = window.getComputedStyle(element).backgroundImage;
        const urlMatch = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
        
        if (urlMatch && urlMatch[1]) {
            img.src = urlMatch[1];
            modal.classList.add('active');
        }
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.remove('active');
}
