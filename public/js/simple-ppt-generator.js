/**
 * Simple PowerPoint Generator
 * This script provides a straightforward implementation for generating PowerPoint presentations
 * from placards in the Teaching Materials Generator application.
 */

// Wait for document to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple PowerPoint Generator loaded');
    
    // Find action buttons and add our download button
    setTimeout(addDownloadButton, 500);
});

// Add download button to the page
function addDownloadButton() {
    const actionBtns = document.querySelector('.action-buttons');
    if (!actionBtns) {
        console.log('Action buttons not found, retrying in 500ms');
        setTimeout(addDownloadButton, 500);
        return;
    }
    
    // Create the button if it doesn't exist
    if (!document.querySelector('.simple-ppt-button')) {
        console.log('Adding download button');
        const btn = document.createElement('button');
        btn.className = 'action-btn simple-ppt-button';
        btn.innerHTML = '<i class="fas fa-file-powerpoint"></i> Download PPT';
        btn.setAttribute('title', 'Download PowerPoint Presentation');
        btn.style.backgroundColor = '#2980b9';
        
        // Add click handler
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            generateAndDownloadPPT();
        });
        
        // Add to page
        actionBtns.appendChild(btn);
        console.log('Download button added successfully');
    }
}

// Main function to generate PowerPoint
function generateAndDownloadPPT() {
    console.log('Starting PowerPoint generation');
    
    // Show loading indicator if available
    const appElement = document.querySelector('[x-data="pptPreview()"]');
    let alpineData = null;
    
    if (appElement && appElement.__x) {
        alpineData = appElement.__x.$data;
        alpineData.showLoading = true;
        alpineData.downloadError = '';
        console.log('Set loading indicator');
    }
    
    try {
        // Create new PowerPoint
        const pptx = new PptxGenJS();
        console.log('PowerPoint instance created');
        
        // Theme colors
        const colors = {
            primary: '#3498db',
            secondary: '#2ecc71',
            text: '#333333',
            background: '#ffffff',
            accent: '#e74c3c',
            subtitle: '#7f8c8d'
        };
        
        // Get metadata from Alpine data if available
        let metadata = {
            topic: 'Educational Presentation',
            gradeLevel: 'Not specified',
            subject: 'General Education',
            classNumber: 'All levels'
        };
        
        if (alpineData && alpineData.metadata) {
            metadata = alpineData.metadata;
        }
        
        // Set presentation properties
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = metadata.topic || 'Educational Presentation';
        
        // Create title slide
        console.log('Creating title slide');
        const titleSlide = pptx.addSlide();
        
        // Add title
        titleSlide.addText(metadata.topic || 'Educational Presentation', {
            x: '5%', y: '40%', w: '90%', h: '15%',
            fontSize: 44, color: colors.primary, bold: true, align: 'center'
        });
        
        // Add subtitle
        titleSlide.addText(`Grade Level: ${metadata.gradeLevel || 'Not specified'}`, {
            x: '5%', y: '55%', w: '90%', h: '10%',
            fontSize: 24, color: colors.subtitle, align: 'center'
        });
        
        // Get all placards
        const placards = document.querySelectorAll('.placard');
        console.log(`Found ${placards.length} placards`);
        
        // Process each placard
        Array.from(placards).forEach((placard, index) => {
            try {
                // Get placard elements
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
                
                // Add title
                slide.addText(title, {
                    x: '5%', y: '5%', w: '90%', h: '10%',
                    fontSize: 28, color: colors.primary, bold: true
                });
                
                // Check for video content
                const videoElem = contentElem.querySelector('iframe[src*="youtube.com"]');
                
                if (videoElem) {
                    // Process video slide
                    const videoSrc = videoElem.getAttribute('src') || '';
                    let videoId = '';
                    
                    if (videoSrc.includes('youtube.com/embed/')) {
                        videoId = videoSrc.split('/embed/')[1]?.split('?')[0];
                    }
                    
                    // Add video information
                    slide.addText('Video Content', {
                        x: '10%', y: '20%', w: '80%', h: '10%',
                        fontSize: 20, color: colors.accent, bold: true
                    });
                    
                    if (videoId) {
                        // Add video URL
                        slide.addText(`https://www.youtube.com/watch?v=${videoId}`, {
                            x: '10%', y: '35%', w: '80%', h: '5%',
                            fontSize: 14, color: colors.text,
                            hyperlink: { url: `https://www.youtube.com/watch?v=${videoId}` }
                        });
                    }
                    
                    // Get description (excluding iframe)
                    const tempElement = contentElem.cloneNode(true);
                    const iframes = tempElement.querySelectorAll('iframe');
                    iframes.forEach(iframe => iframe.remove());
                    
                    const description = tempElement.textContent.trim();
                    if (description) {
                        slide.addText(description, {
                            x: '10%', y: '45%', w: '80%', h: '50%',
                            fontSize: 14, color: colors.text, breakLine: true
                        });
                    }
                } else {
                    // Regular content slide
                    const content = contentElem.textContent.trim();
                    
                    if (content && content.length > 0) {
                        slide.addText(content, {
                            x: '5%', y: '20%', w: '90%', h: '75%',
                            fontSize: 16, color: colors.text, breakLine: true
                        });
                    } else {
                        slide.addText('No content available for this slide.', {
                            x: '5%', y: '45%', w: '90%', h: '10%',
                            fontSize: 16, color: colors.text, align: 'center'
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing placard ${index}:`, error);
            }
        });
        
        // Generate filename
        const safeFilename = metadata.topic 
            ? metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            : 'educational_presentation';
        
        console.log(`Writing PowerPoint to file: ${safeFilename}.pptx`);
        
        // Download the PowerPoint
        pptx.writeFile({ fileName: `${safeFilename}.pptx` })
            .then(() => {
                console.log('PowerPoint saved successfully');
                
                // Show success message
                if (alpineData) {
                    alpineData.showLoading = false;
                    alpineData.showSuccessMessage = true;
                    setTimeout(() => {
                        alpineData.showSuccessMessage = false;
                    }, 3000);
                }
            })
            .catch(err => {
                console.error('Error saving PowerPoint:', err);
                
                if (alpineData) {
                    alpineData.downloadError = `Error saving PowerPoint: ${err.message || 'Unknown error'}`;
                    alpineData.showLoading = false;
                } else {
                    alert(`Error saving PowerPoint: ${err.message || 'Unknown error'}`);
                }
            });
    } catch (error) {
        console.error('Error generating PowerPoint:', error);
        
        if (alpineData) {
            alpineData.downloadError = `Error generating PowerPoint: ${error.message}`;
            alpineData.showLoading = false;
        } else {
            alert(`Error generating PowerPoint: ${error.message}`);
        }
    }
}
