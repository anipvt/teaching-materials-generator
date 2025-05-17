// Initialize AlpineJS
document.addEventListener('alpine:init', () => {
  Alpine.store('theme', {
    dark: true,
    toggle() {
      this.dark = !this.dark;
      localStorage.setItem('darkMode', this.dark);
      this.applyTheme();
    },
    init() {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        this.dark = savedTheme === 'true';
      }
      this.applyTheme();
    },
    applyTheme() {
      if (this.dark) {
        document.documentElement.setAttribute('data-theme', 'retroDark');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'retroLight');
        document.documentElement.classList.remove('dark');
      }
    }
  });

  // Store for handling generated content
  Alpine.store('content', {
    history: [],
    currentContent: null,
    loading: false,
    
    init() {
      // Load history from localStorage
      const savedHistory = localStorage.getItem('generationHistory');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
    },
    
    saveToHistory(data) {
      // Add timestamp
      data.timestamp = new Date().toISOString();
      
      // Add to history array
      this.history.unshift(data);
      
      // Keep only the last 10 items
      if (this.history.length > 10) {
        this.history = this.history.slice(0, 10);
      }
      
      // Save to localStorage
      localStorage.setItem('generationHistory', JSON.stringify(this.history));
    },
    
    clearHistory() {
      this.history = [];
      localStorage.removeItem('generationHistory');
    },
    
    formatContent(content) {
      if (!content) return '';
      
      // Convert line breaks to <br>
      let formatted = content.replace(/\n/g, '<br>');
      
      // Convert headers (# Header)
      formatted = formatted.replace(/# (.*?)<br>/g, '<h1 class="text-xl font-bold text-retro-cyan my-4">$1</h1>');
      formatted = formatted.replace(/## (.*?)<br>/g, '<h2 class="text-lg font-semibold text-retro-yellow my-3">$1</h2>');
      formatted = formatted.replace(/### (.*?)<br>/g, '<h3 class="text-md font-medium text-retro-green my-2">$1</h3>');
      
      // Convert bullet points
      formatted = formatted.replace(/- (.*?)<br>/g, '<li class="ml-5 list-disc">$1</li>');
      
      // Convert numbered lists
      formatted = formatted.replace(/\d+\. (.*?)<br>/g, '<li class="ml-5 list-decimal">$1</li>');
      
      // Convert bold text
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-retro-purple">$1</strong>');
      
      // Convert italic text
      formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-retro-cyan">$1</em>');
      
      // Convert links
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-retro-green underline hover:text-retro-neon">$1</a>');
      
      return formatted;
    }
  });
});

// CRT Effect toggle
function toggleCRTEffect() {
  const body = document.querySelector('body');
  body.classList.toggle('crt');
  localStorage.setItem('crtEffect', body.classList.contains('crt'));
}

// Initialize CRT effect from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const crtEnabled = localStorage.getItem('crtEffect') === 'true';
  if (crtEnabled) {
    document.querySelector('body').classList.add('crt');
    document.getElementById('crtToggle').checked = true;
  }
  
  // Initialize AlpineJS theme
  if (window.Alpine) {
    Alpine.store('theme').init();
  }
  
  // Apply typing animation to typedElements
  const typedElements = document.querySelectorAll('.typed-text');
  typedElements.forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    let i = 0;
    
    function typeWriter() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, Math.random() * 50 + 50);
      }
    }
    
    typeWriter();
  });
});
