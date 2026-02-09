document.addEventListener('DOMContentLoaded', () => {
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    const updateActiveLink = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink);

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });

    // Copy to clipboard functionality
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        block.appendChild(copyBtn);

        copyBtn.addEventListener('click', () => {
            const code = block.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Try It Out Console Logic
    const tryItSections = document.querySelectorAll('.try-it-out-section');

    tryItSections.forEach(section => {
        const executeBtn = section.querySelector('.execute-btn');
        const responseArea = section.querySelector('.response-area');
        const responseCodeBlock = responseArea.querySelector('code');
        const statusBadge = responseArea.querySelector('.status-badge');
        const textArea = section.querySelector('textarea');

        executeBtn.addEventListener('click', async () => {
            const method = section.dataset.method;
            const url = section.dataset.url;
            let body = null;
            let headers = {
                'Accept': 'application/json'
            };

            // Prepare Request
            if (method === 'POST' || method === 'PUT') {
                const rawBody = textArea ? textArea.value : '';
                try {
                    if (rawBody) {
                        // Validate JSON
                        body = JSON.stringify(JSON.parse(rawBody));
                        headers['Content-Type'] = 'application/json';
                    }
                } catch (e) {
                    alert('Invalid JSON in request body');
                    return;
                }
            }

            // UI Loading State
            executeBtn.disabled = true;
            executeBtn.textContent = 'Executing...';
            // Hide previous response content but keep area if needed - actually simpler to hide first
            responseArea.classList.remove('visible');

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: body
                });

                const contentType = response.headers.get("content-type");
                let data;
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }

                // Update Status Badge
                statusBadge.textContent = `${response.status} ${response.statusText}`;
                statusBadge.className = 'status-badge ' + (response.ok ? 'status-success' : 'status-error');

                // Update Response Body
                if (typeof data === 'object') {
                    responseCodeBlock.textContent = JSON.stringify(data, null, 2);
                } else {
                    responseCodeBlock.textContent = data;
                }

                // Show Result
                responseArea.classList.add('visible');
                responseArea.style.display = 'block';

            } catch (error) {
                // Network Error Handling
                statusBadge.textContent = 'Network Error';
                statusBadge.className = 'status-badge status-error';
                responseCodeBlock.textContent = `Error: ${error.message}\nMake sure the API service is running on port 8001.`;

                responseArea.classList.add('visible');
                responseArea.style.display = 'block';
            } finally {
                // Reset Button
                executeBtn.disabled = false;
                executeBtn.textContent = 'Execute';
            }
        });
    });
});
