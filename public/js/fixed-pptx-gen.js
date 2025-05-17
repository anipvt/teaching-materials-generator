/**
 * Fixed PowerPoint Generator using PptxGenJS
 * This script handles the generation and downloading of PowerPoint presentations
 * from placards in the Teaching Materials Generator application.
 */

// Function to be called from the UI
function downloadPPTX() {
    console.log('Starting PowerPoint generation...');
    
    try {
        // Get Alpine.js data
        const appElement = document.querySelector('[x-data="pptPreview()"]');
        if (!appElement || !appElement.__x) {
            console.error('Cannot access Alpine.js data');
            alert('Error: Cannot generate PowerPoint. Please try again.');
            return;
        }
        
        const alpineData = appElement.__x.$data;
        
        // Set loading state
        alpineData.showLoading = true;
        alpineData.downloadError = '';
        
        // Create new PowerPoint instance
        const pptx = new PptxGenJS();
        
        // Set presentation properties
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = alpineData.metadata.topic || 'Educational Presentation';
        pptx.subject = `Grade Level: ${alpineData.metadata.gradeLevel || 'Not specified'}`;
        pptx.author = 'Teaching Materials Generator';
        
        // Define theme colors
        const colors = {
            primary: '#3498db',    // Blue
            secondary: '#2ecc71',  // Green
            text: '#333333',       // Dark gray
            background: '#ffffff', // White
            accent: '#e74c3c',     // Red
            subtitle: '#7f8c8d'    // Gray
        };
        
        // Create title slide
        const titleSlide = pptx.addSlide();
        titleSlide.addText(alpineData.metadata.topic || 'Educational Presentation', {
            x: '5%', y: '40%', w: '90%', h: '15%',
            fontSize: 44,
            color: colors.primary,
            bold: true,
            align: 'center'
        });
        
        // Add subtitle with grade level
        titleSlide.addText(`Grade Level: ${alpineData.metadata.gradeLevel || 'Not specified'}`, {
            x: '5%', y: '55%', w: '90%', h: '10%',
            fontSize: 24,
            color: colors.subtitle,
            align: 'center'
        });
        
        console.log('Title slide created');
        
        // Get all placards from the page
        const placards = document.querySelectorAll('.placard');
        console.log('Found placards:', placards.length);
        
        // Process each placard and add to PowerPoint
        Array.from(placards).forEach((placard, index) => {
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
                // This is a video slide
                const videoSrc = videoElem.getAttribute('src') || '';
                let videoId = '';
                
                // Extract video ID
                if (videoSrc.includes('youtube.com/embed/')) {
                    videoId = videoSrc.split('/embed/')[1]?.split('?')[0];
                }
                
                if (videoId) {
                    // Add video thumbnail
                    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    console.log('Adding video thumbnail:', thumbnailUrl);
                    
                    // PptxGenJS requires base64 images for better reliability
                    // First, create an image element
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.onload = function() {
                        // Create a canvas to convert the image to base64
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        try {
                            // Get base64 data
                            const base64Img = canvas.toDataURL('image/jpeg');
                            
                            // Add image to slide
                            slide.addImage({
                                data: base64Img,
                                x: '10%', y: '20%', w: '80%', h: '45%'
                            });
                            
                            // Add video URL
                            slide.addText(`Video URL: https://www.youtube.com/watch?v=${videoId}`, {
                                x: '10%', y: '70%', w: '80%', h: '5%',
                                fontSize: 14, color: colors.text
                            });
                            
                            // Get description text (excluding the iframe)
                            const tempContent = contentElem.cloneNode(true);
                            const iframes = tempContent.querySelectorAll('iframe');
                            iframes.forEach(iframe => iframe.remove());
                            
                            const description = tempContent.textContent.trim();
                            if (description) {
                                slide.addText(description, {
                                    x: '10%', y: '75%', w: '80%', h: '20%',
                                    fontSize: 14, color: colors.text,
                                    breakLine: true
                                });
                            }
                        } catch (error) {
                            console.warn('Unable to add thumbnail:', error);
                            fallbackVideoContent(slide, videoId, tempContent, colors);
                        }
                    };
                    
                    img.onerror = function() {
                        console.warn('Failed to load image:', thumbnailUrl);
                        fallbackVideoContent(slide, videoId, contentElem, colors);
                    };
                    
                    // Start loading the image
                    img.src = thumbnailUrl;
                } else {
                    // No video ID found
                    fallbackVideoContent(slide, null, contentElem, colors);
                }
            } else {
                // This is a regular content slide
                const content = contentElem.textContent.trim();
                
                if (content && content.length > 0) {
                    console.log(`Adding content to slide ${index + 1}:`, 
                              content.substring(0, 50) + '...');
                    
                    slide.addText(content, {
                        x: '5%', y: '20%', w: '90%', h: '75%',
                        fontSize: 16,
                        color: colors.text,
                        breakLine: true
                    });
                } else {
                    slide.addText('No content available for this slide.', {
                        x: '5%', y: '45%', w: '90%', h: '10%',
                        fontSize: 16, color: colors.text,
                        align: 'center'
                    });
                }
            }
        });
        
        // Generate filename
        const safeFilename = alpineData.metadata.topic 
            ? alpineData.metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            : 'presentation';
        
        console.log('Saving PowerPoint as:', `${safeFilename}.pptx`);
        
        // Write file with explicit export type and callbacks
        pptx.writeFile({ 
            fileName: `${safeFilename}.pptx`,
            successCallback: function() {
                console.log('PowerPoint saved successfully');
                alpineData.showLoading = false;
                alpineData.showSuccessMessage = true;
                setTimeout(() => {
                    alpineData.showSuccessMessage = false;
                }, 3000);
            },
            errorCallback: function(err) {
                console.error('Error saving PowerPoint:', err);
                alpineData.downloadError = 'Error saving PowerPoint: ' + (err.message || 'Unknown error');
                alpineData.showLoading = false;
            }
        });
    } catch (error) {
        console.error('Error generating PowerPoint:', error);
        const appElement = document.querySelector('[x-data="pptPreview()"]');
        if (appElement && appElement.__x) {
            appElement.__x.$data.downloadError = 'Error generating PowerPoint: ' + error.message;
            appElement.__x.$data.showLoading = false;
        } else {
            alert('Error generating PowerPoint: ' + error.message);
        }
    }
}

// Helper function for video slide fallback content
function fallbackVideoContent(slide, videoId, contentElem, colors) {
    slide.addText('Video Thumbnail Not Available', {
        x: '10%', y: '35%', w: '80%', h: '20%',
        fontSize: 16, color: colors.text,
        align: 'center'
    });
    
    if (videoId) {
        slide.addText(`Video URL: https://www.youtube.com/watch?v=${videoId}`, {
            x: '10%', y: '70%', w: '80%', h: '5%',
            fontSize: 14, color: colors.text
        });
    }
    
    // Get description text (excluding the iframe)
    const tempContent = contentElem.cloneNode(true);
    const iframes = tempContent.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.remove());
    
    const description = tempContent.textContent.trim();
    if (description) {
        slide.addText(description, {
            x: '10%', y: '75%', w: '80%', h: '20%',
            fontSize: 14, color: colors.text,
            breakLine: true
        });
    }
}

// Add event listener to the download button when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add a button directly to the DOM
    const addDownloadButton = function() {
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            // Check if button already exists
            if (!document.querySelector('.fixed-ppt-download')) {
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'action-btn fixed-ppt-download';
                downloadBtn.innerHTML = '<i class="fas fa-file-powerpoint"></i> Download PPT';
                downloadBtn.title = 'Download PowerPoint presentation';
                downloadBtn.style.backgroundColor = '#3498db';
                downloadBtn.style.color = 'white';
                downloadBtn.style.padding = '8px 15px';
                downloadBtn.style.border = 'none';
                downloadBtn.style.borderRadius = '4px';
                downloadBtn.style.cursor = 'pointer';
                downloadBtn.style.transition = 'background-color 0.3s';
                downloadBtn.style.margin = '0 5px';
                
                downloadBtn.addEventListener('mouseover', function() {
                    this.style.backgroundColor = '#2980b9';
                });
                
                downloadBtn.addEventListener('mouseout', function() {
                    this.style.backgroundColor = '#3498db';
                });
                
                // Add click event listener
                downloadBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    downloadPPTX();
                });
                
                // Add to page
                actionButtons.appendChild(downloadBtn);
                console.log('Download PPT button added');
            }
        } else {
            // If action buttons container not yet loaded, retry after a short delay
            setTimeout(addDownloadButton, 500);
        }
    };
    
    // Start the process of adding the button
    addDownloadButton();
});
