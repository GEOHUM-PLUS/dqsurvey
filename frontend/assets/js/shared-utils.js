
// ======================================================
// GLOBAL HTML TOOLTIP HANDLER (For all sections)
// ======================================================
export function initializeTooltips() {
  document.querySelectorAll('.info-icon[data-tooltip]').forEach(el => {
    const html = el.getAttribute('data-tooltip');

    el.addEventListener('mouseenter', () => {
      // Remove any existing tooltip
      el.querySelector('.html-tooltip')?.remove();
      
      const tooltip = document.createElement('div');
      tooltip.className = 'html-tooltip';
      tooltip.innerHTML = html;
      
      el.style.position = 'relative';
      el.appendChild(tooltip);
    });

    el.addEventListener('mouseleave', () => {
      el.querySelector('.html-tooltip')?.remove();
    });
    
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const tooltip = el.querySelector('.html-tooltip');
      if (tooltip) {
        tooltip.remove();
      } else {
        const newTooltip = document.createElement('div');
        newTooltip.className = 'html-tooltip';
        newTooltip.innerHTML = html;
        el.style.position = 'relative';
        el.appendChild(newTooltip);
      }
    });
  });
}


// ---- NAVBAR SECTION HIGHLIGHTING ----
export function highlightActiveSection(sectionName) {
  // Remove active class from all nav links
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to matching nav link
  const navLink = document.querySelector(`.navbar-nav .nav-link[data-section="${sectionName}"]`);
  if (navLink) {
    navLink.classList.add('active');
  }
}

// Get current section from page URL
export function getCurrentSection() {
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage.includes('section1')) return 'section1';
  if (currentPage.includes('section2')) return 'section2';
  if (currentPage.includes('section3')) return 'section3';
  if (currentPage.includes('section4')) return 'section4';
  if (currentPage.includes('section5')) return 'section5';
  if (currentPage.includes('section6')) return 'section6';
  return null;
}

// Initialize highlighting on section pages
export function initializeHighlighting() {
  const currentPage = window.location.pathname.split('/').pop();
  const isHomePage = currentPage === '' || currentPage === 'index.html' || currentPage.endsWith('/');
  
  if (!isHomePage) {
    const currentSection = getCurrentSection();
    if (currentSection) {
      highlightActiveSection(currentSection);
    }
  }
}

// ---- CONFORMANCE VISIBILITY ----
export function applyConformanceVisibility(processingLevel) {
  const conf = document.getElementById('conformance');
  const toc = document.getElementById('conformance-toc');
  const navConf = document.getElementById('nav-conformance');
  
  console.log('applyConformanceVisibility called with:', processingLevel);
  
  if (processingLevel === 'primary') {
    console.log('Hiding conformance (primary data selected)');
    if (conf) conf.classList.add('d-none');
    if (toc) toc.classList.add('d-none');
    if (navConf) navConf.classList.add('d-none');
  } else if (processingLevel === 'products' || processingLevel === '') {
    console.log('Showing conformance (data products selected or empty)');
    if (conf) conf.classList.remove('d-none');
    if (toc) toc.classList.remove('d-none');
    if (navConf) navConf.classList.remove('d-none');
  }
}

// Update navigation buttons to skip conformance when hidden
export function updateNavigationButtons() {
  const savedProcessingLevel = sessionStorage.getItem('dataProcessingLevel');
  const isConformanceHidden = savedProcessingLevel === 'primary';
  
  // console.log('updateNavigationButtons called, isConformanceHidden:', isConformanceHidden);
  
  const currentPage = window.location.pathname.split('/').pop();
  
  if (currentPage === 'section3.html' && isConformanceHidden) {
    const nextBtns = document.querySelectorAll('a[href="section4.html"]');
    nextBtns.forEach(btn => {
      if (btn.classList.contains('btn-next') || btn.textContent.includes('Next')) {
        btn.href = 'section5.html';
        if (btn.textContent.includes('Next Section')) {
          btn.innerHTML = btn.innerHTML.replace('Next Section', 'Skip to Context');
        }
        console.log('Updated next button on section3 to skip to section5');
      }
    });
  }
  
  if (currentPage === 'section5.html' && isConformanceHidden) {
    const prevBtns = document.querySelectorAll('a[href="section4.html"]');
    prevBtns.forEach(btn => {
      if (btn.classList.contains('btn-previous') || btn.textContent.includes('Previous')) {
        btn.href = 'section3.html';
        if (btn.textContent.includes('Previous')) {
          btn.innerHTML = btn.innerHTML.replace('Previous', 'Skip to Design');
        }
        console.log('Updated previous button on section5 to skip to section3');
      }
    });
  }
}

