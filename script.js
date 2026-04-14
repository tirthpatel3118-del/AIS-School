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

        fetch(sheetCSVUrl)
            .then(response => response.text())
            .then(csvText => {
                const rows = parseCSV(csvText);

                if (rows.length < 2) {
                    renderNoticeFallback(
                        dynamicNotices,
                        'No notices published yet.',
                        'Add rows in the linked Google Sheet and they will appear here automatically.'
                    );
                    return;
                }

                const headers = rows[0].map(header => normalizeHeader(header));
                const noticeRows = rows
                    .slice(1)
                    .map(row => mapNoticeRow(headers, row))
                    .filter(notice => notice.title || notice.summary || notice.link);

                if (noticeRows.length === 0) {
                    renderNoticeFallback(
                        dynamicNotices,
                        'The sheet is connected, but no complete notice rows were found.',
                        'Recommended columns: Title, Summary, Image, Link, Button, Category, Date.'
                    );
                    return;
                }

                dynamicNotices.innerHTML = '';
                noticeRows.forEach(notice => {
                    dynamicNotices.appendChild(createNoticeCard(notice));
                });
            })
            .catch(error => {
                console.error("Error fetching notices:", error);
                renderNoticeFallback(
                    dynamicNotices,
                    'Unable to load notices right now.',
                    'Please try again later or contact the school office for the latest updates.'
                );
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

function parseCSV(csvText) {
    const rows = [];
    let currentValue = '';
    let currentRow = [];
    let insideQuotes = false;

    for (let index = 0; index < csvText.length; index += 1) {
        const char = csvText[index];
        const nextChar = csvText[index + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentValue += '"';
                index += 1;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentValue.trim());
            currentValue = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') {
                index += 1;
            }

            currentRow.push(currentValue.trim());
            if (currentRow.some(value => value !== '')) {
                rows.push(currentRow);
            }

            currentRow = [];
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    if (currentValue || currentRow.length) {
        currentRow.push(currentValue.trim());
        if (currentRow.some(value => value !== '')) {
            rows.push(currentRow);
        }
    }

    return rows;
}

function normalizeHeader(header) {
    return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function mapNoticeRow(headers, row) {
    const values = {};

    headers.forEach((header, index) => {
        values[header] = (row[index] || '').trim();
    });

    return {
        title: pickValue(values, ['title', 'heading', 'notice', 'eventtitle']),
        summary: pickValue(values, ['summary', 'description', 'details', 'message', 'content']),
        image: pickValue(values, ['image', 'imageurl', 'photo', 'photolink', 'poster']),
        link: pickValue(values, ['link', 'url', 'redirectlink', 'buttonlink', 'registrationlink']),
        button: pickValue(values, ['button', 'buttontext', 'cta', 'linklabel']) || 'View Details',
        category: pickValue(values, ['category', 'type', 'tag']) || 'Notice',
        date: pickValue(values, ['date', 'publishdate', 'eventdate'])
    };
}

function pickValue(values, keys) {
    return keys.map(key => values[key]).find(Boolean) || '';
}

function createNoticeCard(notice) {
    const article = document.createElement('article');
    article.className = 'notice-card fade-up visible';

    if (notice.image) {
        const image = document.createElement('div');
        image.className = 'notice-card-image';
        image.style.backgroundImage = `url("${notice.image}")`;
        article.appendChild(image);
    }

    const content = document.createElement('div');
    content.className = 'notice-card-content';

    const meta = document.createElement('div');
    meta.className = 'notice-card-meta';

    const chip = document.createElement('span');
    chip.className = 'notice-chip';
    chip.textContent = notice.category;
    meta.appendChild(chip);

    if (notice.date) {
        const date = document.createElement('span');
        date.className = 'notice-date';
        date.textContent = notice.date;
        meta.appendChild(date);
    }

    content.appendChild(meta);

    const title = document.createElement('h3');
    title.textContent = notice.title || 'School Update';
    content.appendChild(title);

    const summary = document.createElement('p');
    summary.textContent = notice.summary || 'Tap below to view the full notice or event details.';
    content.appendChild(summary);

    if (notice.link) {
        const action = document.createElement('a');
        action.className = 'notice-link';
        action.href = notice.link;
        action.target = '_blank';
        action.rel = 'noopener noreferrer';
        action.textContent = notice.button;

        const arrow = document.createElement('span');
        arrow.textContent = '→';
        action.appendChild(arrow);
        content.appendChild(action);
    }

    article.appendChild(content);
    return article;
}

function renderNoticeFallback(container, title, message) {
    container.innerHTML = '';

    const article = document.createElement('article');
    article.className = 'notice-card notice-empty';

    const content = document.createElement('div');
    content.className = 'notice-card-content';

    const chip = document.createElement('span');
    chip.className = 'notice-chip';
    chip.textContent = 'Notice Board';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const body = document.createElement('p');
    body.textContent = message;

    content.appendChild(chip);
    content.appendChild(heading);
    content.appendChild(body);
    article.appendChild(content);
    container.appendChild(article);
}
