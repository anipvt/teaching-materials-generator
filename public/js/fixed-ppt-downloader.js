/**
 * Fixed PowerPoint Downloader
 * This script provides a clean implementation for downloading PowerPoint presentations
 * from placards in the Teaching Materials Generator application.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add a new button to the page that will use our clean implementation
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn download-ppt-fixed';
        downloadBtn.innerHTML = '<i class="fas fa-file-powerpoint"></i> Download Fixed PPT';
        downloadBtn.title = 'Download PowerPoint using fixed generator';
        downloadBtn.style.backgroundColor = '#28a745'; // Green to differentiate
        downloadBtn.onclick = downloadFixedPPTX;
        
        // Add to page
        actionButtons.appendChild(downloadBtn);
        console.log('Fixed PPT download button added');
    }
});

/**
 * Download a PowerPoint presentation with proper content extraction
 */
async function downloadFixedPPTX() {
    // Show loading indicator
    const appElement = document.querySelector('[x-data="pptPreview()"]');
    if (appElement && appElement.__x) {
        appElement.__x.$data.showLoading = true;
        appElement.__x.$data.downloadError = '';
    }
    
    try {
        console.log('Starting fixed PowerPoint generation');
        
        // Get metadata from Alpine.js data
        let metadata = {};
        if (appElement && appElement.__x) {
            metadata = appElement.__x.$data.metadata || {};
        }
        
        // Create PowerPoint
        const pptx = new PptxGenJS();
        
        // Set theme colors
        const colors = {
            primary: '#3498db',    // Blue
            secondary: '#2ecc71',  // Green
            text: '#333333',       // Dark gray
            background: '#ffffff', // White
            accent: '#e74c3c',     // Red
            subtitle: '#7f8c8d'    // Gray
        };
        
        // Set presentation properties
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = metadata.topic || 'Educational Presentation';
        pptx.subject = `Grade Level: ${metadata.gradeLevel || 'Not specified'}`;
        pptx.author = 'Teaching Materials Generator';
        
        // Create title slide
        const titleSlide = pptx.addSlide();
        titleSlide.addText(metadata.topic || 'Educational Presentation', {
            x: '5%', y: '40%', w: '90%', h: '15%',
            fontSize: 44,
            color: colors.primary,
            bold: true,
            align: 'center'
        });
        
        // Add subtitle with grade level
        titleSlide.addText(`Grade Level: ${metadata.gradeLevel || 'Not specified'}`, {
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
                    
                    try {
                        slide.addImage({
                            path: thumbnailUrl,
                            x: '10%', y: '20%', w: '80%', h: '45%'
                        });
                    } catch (error) {
                        console.warn('Unable to add thumbnail:', error);
                        slide.addText('Video Thumbnail Not Available', {
                            x: '10%', y: '35%', w: '80%', h: '20%',
                            fontSize: 16, color: colors.text,
                            align: 'center'
                        });
                    }
                    
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
        const safeFilename = metadata.topic 
            ? metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            : 'presentation';
        
        console.log('Saving PowerPoint as:', `${safeFilename}.pptx`);
        
        // Save the PowerPoint file
        await pptx.writeFile({ fileName: `${safeFilename}.pptx` });
        console.log('PowerPoint saved successfully');
        
        // Update UI
        if (appElement && appElement.__x) {
            appElement.__x.$data.showLoading = false;
            appElement.__x.$data.showSuccessMessage = true;
            setTimeout(() => {
                appElement.__x.$data.showSuccessMessage = false;
            }, 3000);
        }
    } catch (error) {
        console.error('Error generating PowerPoint:', error);
        if (appElement && appElement.__x) {
            appElement.__x.$data.downloadError = 'Error generating PowerPoint: ' + error.message;
            appElement.__x.$data.showLoading = false;
        }
    }
}
