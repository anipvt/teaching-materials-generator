// Fixed PowerPoint download function
async function downloadPPTX() {
    this.showLoading = true;
    this.downloadError = '';
    
    try {
        console.log('Starting PowerPoint generation');
        
        // Create a new PowerPoint presentation
        const pptx = new PptxGenJS();
        
        // Set theme colors based on selected theme
        const colors = {
            primary: '#f89406',    // Orange
            secondary: '#2ecc71',  // Green
            text: '#333333',       // Dark gray
            background: '#ffffff', // White
            accent: '#e74c3c',     // Red
            subtitle: '#7f8c8d'    // Gray
        };
        
        // Set presentation properties
        pptx.layout = 'LAYOUT_16x9';
        pptx.title = this.metadata.topic || 'Educational Presentation';
        pptx.subject = `Grade Level: ${this.metadata.gradeLevel || 'Not specified'}`;
        pptx.author = 'Teaching Materials Generator';
        
        // Create title slide
        const titleSlide = pptx.addSlide();
        titleSlide.addText(this.metadata.topic || 'Educational Presentation', {
            x: '5%', y: '40%', w: '90%', h: '15%',
            fontSize: 44,
            color: colors.primary,
            bold: true,
            align: 'center'
        });
        
        // Add subtitle with grade level
        titleSlide.addText(`Grade Level: ${this.metadata.gradeLevel || 'Not specified'}`, {
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
        const safeFilename = this.metadata.topic 
            ? this.metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            : 'presentation';
        
        console.log('Saving PowerPoint as:', `${safeFilename}.pptx`);
        
        // Save the PowerPoint file
        await pptx.writeFile({ fileName: `${safeFilename}.pptx` });
        console.log('PowerPoint saved successfully');
        
        this.showLoading = false;
        this.showSuccessMessage = true;
        setTimeout(() => {
            this.showSuccessMessage = false;
        }, 3000);
    } catch (error) {
        console.error('Error generating PowerPoint:', error);
        this.downloadError = 'Error generating PowerPoint: ' + error.message;
        this.showLoading = false;
    }
}
