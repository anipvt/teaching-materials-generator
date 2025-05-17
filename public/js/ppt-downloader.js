/**
 * PowerPoint Downloader
 * A reliable implementation for generating and downloading PowerPoint presentations
 * using the PptxGenJS library.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('PowerPoint Downloader script loaded');
    
    // Add download button to UI
    setTimeout(addDownloadButton, 500);
});

// Add a download button to the page
function addDownloadButton() {
    const actionButtons = document.querySelector('.action-buttons');
    if (!actionButtons) {
        console.log('Action buttons container not found, retrying in 500ms');
        setTimeout(addDownloadButton, 500);
        return;
    }
    
    // Create button if it doesn't exist
    if (!document.querySelector('.ppt-download-btn')) {
        console.log('Creating download button');
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn ppt-download-btn';
        downloadBtn.innerHTML = '<i class="fas fa-file-powerpoint"></i> Download PPT';
        downloadBtn.title = 'Download PowerPoint';
        downloadBtn.setAttribute('data-action', 'download-ppt');
        
        // Add click event
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Download button clicked');
            generateAndDownloadPPT();
        });
        
        // Add to page
        actionButtons.appendChild(downloadBtn);
        console.log('Download button added successfully');
    }
}

// Main function to generate and download PowerPoint
function generateAndDownloadPPT() {
    console.log('Starting PowerPoint generation process');
    
    // Get Alpine data
    const appElement = document.querySelector('[x-data="pptPreview()"]');
    if (!appElement || !appElement.__x) {
        console.error('Cannot access Alpine.js data');
        alert('Error: Cannot generate PowerPoint. Please reload the page and try again.');
        return;
    }
    
    const alpineData = appElement.__x.$data;
    
    // Show loading indicator
    alpineData.showLoading = true;
    alpineData.downloadError = '';
    
    try {
        // Create new instance
        const pptx = new PptxGenJS();
        console.log('PptxGenJS instance created');
        
        // Set presentation properties
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = alpineData.metadata.topic || 'Educational Presentation';
        
        // Colors for slide design
        const colors = {
            primary: '#3498db',
            secondary: '#2ecc71',
            text: '#333333',
            background: '#ffffff',
            accent: '#e74c3c',
            subtitle: '#7f8c8d'
        };
        
        // Add title slide
        console.log('Creating title slide');
        const titleSlide = pptx.addSlide();
        
        titleSlide.addText(alpineData.metadata.topic || 'Educational Presentation', {
            x: '5%', y: '40%', w: '90%', h: '15%',
            fontSize: 44,
            color: colors.primary,
            bold: true,
            align: 'center'
        });
        
        titleSlide.addText(`Grade Level: ${alpineData.metadata.gradeLevel || 'Not specified'}`, {
            x: '5%', y: '55%', w: '90%', h: '10%',
            fontSize: 24,
            color: colors.subtitle,
            align: 'center'
        });
        
        // Process placards
        const placards = document.querySelectorAll('.placard');
        console.log(`Found ${placards.length} placards to process`);
        
        // For each placard, create a slide
        Array.from(placards).forEach((placard, index) => {
            processPlacardIntoSlide(pptx, placard, index, colors);
        });
        
        // Generate filename
        const safeFilename = alpineData.metadata.topic 
            ? alpineData.metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            : 'educational_presentation';
            
        console.log(`Preparing to download as: ${safeFilename}.pptx`);
        
        // Write the file and download it
        pptx.writeFile({ fileName: `${safeFilename}.pptx` })
            .then(() => {
                console.log('PowerPoint saved successfully');
                alpineData.showLoading = false;
                alpineData.showSuccessMessage = true;
                setTimeout(() => {
                    alpineData.showSuccessMessage = false;
                }, 3000);
            })
            .catch(err => {
                console.error('Error saving PowerPoint:', err);
                alpineData.downloadError = `Error saving PowerPoint: ${err.message || 'Unknown error'}`;
                alpineData.showLoading = false;
            });
            
    } catch (error) {
        console.error('Error generating PowerPoint:', error);
        alpineData.downloadError = `Error generating PowerPoint: ${error.message}`;
        alpineData.showLoading = false;
    }
}

// Process a placard element into a slide
function processPlacardIntoSlide(pptx, placard, index, colors) {
    try {
        // Extract placard content
        const titleElem = placard.querySelector('.placard-title');
        const contentElem = placard.querySelector('.placard-content');
        
        if (!titleElem || !contentElem) {
            console.log(`Skipping placard ${index} - missing elements`);
            return;
        }
        
        const title = titleElem.textContent.trim();
        console.log(`Processing placard ${index + 1}: ${title}`);
        
        // Create a slide
        const slide = pptx.addSlide();
        
        // Add the title
        slide.addText(title, {
            x: '5%', y: '5%', w: '90%', h: '10%',
            fontSize: 28,
            color: colors.primary,
            bold: true
        });
        
        // Check if this is a video slide
        const videoElem = contentElem.querySelector('iframe[src*="youtube.com"]');
        
        if (videoElem) {
            // Process as video slide
            processVideoSlide(slide, videoElem, contentElem, colors);
        } else {
            // Process as text slide
            processTextSlide(slide, contentElem, colors);
        }
    } catch (err) {
        console.error(`Error processing placard ${index}:`, err);
    }
}

// Process a text-based slide
function processTextSlide(slide, contentElem, colors) {
    const content = contentElem.textContent.trim();
    
    if (content && content.length > 0) {
        slide.addText(content, {
            x: '5%', y: '20%', w: '90%', h: '75%',
            fontSize: 16,
            color: colors.text,
            breakLine: true
        });
    } else {
        slide.addText('No content available for this slide.', {
            x: '5%', y: '45%', w: '90%', h: '10%',
            fontSize: 16, 
            color: colors.text,
            align: 'center'
        });
    }
}

// Process a video slide
function processVideoSlide(slide, videoElem, contentElem, colors) {
    // Extract video ID
    const videoSrc = videoElem.getAttribute('src') || '';
    let videoId = '';
    
    if (videoSrc.includes('youtube.com/embed/')) {
        videoId = videoSrc.split('/embed/')[1]?.split('?')[0];
    }
    
    if (!videoId) {
        // No video ID found, just add text
        processTextSlide(slide, contentElem, colors);
        return;
    }
    
    // Add text indicating this is a video
    slide.addText('Video Content', {
        x: '10%', y: '20%', w: '80%', h: '10%',
        fontSize: 20,
        color: colors.accent,
        bold: true
    });
    
    // Add video URL text
    slide.addText(`Video URL: https://www.youtube.com/watch?v=${videoId}`, {
        x: '10%', y: '35%', w: '80%', h: '5%',
        fontSize: 14,
        color: colors.text,
        hyperlink: { url: `https://www.youtube.com/watch?v=${videoId}` }
    });
    
    // Get description text (excluding the iframe)
    const tempContent = contentElem.cloneNode(true);
    const iframes = tempContent.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.remove());
    
    const description = tempContent.textContent.trim();
    if (description) {
        slide.addText(description, {
            x: '10%', y: '45%', w: '80%', h: '50%',
            fontSize: 14,
            color: colors.text,
            breakLine: true
        });
    }
}
