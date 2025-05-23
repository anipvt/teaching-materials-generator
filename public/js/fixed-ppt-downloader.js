/**
 * Enhanced PowerPoint Downloader
 * This script provides a professionally formatted implementation for downloading PowerPoint presentations
 * from placards in the Teaching Materials Generator application.
 * 
 * Features:
 * - Proper text alignment and overflow handling
 * - Consistent font sizes and styling
 * - Professional slide layouts with appropriate margins
 * - Clean structure for title, content and media slides
 */

document.addEventListener('DOMContentLoaded', function() {
    // Button removed per user request
    console.log('Enhanced PPT downloader loaded but button not added');
});

/**
 * Download a PowerPoint presentation with enhanced formatting and professional layout
 * 
 * Formatting details:
 * - Title: 32pt, bold, centered (#3498db)
 * - Subtitle: 20pt, italic, centered/left-aligned (#666666)
 * - Body text: 18pt, left-aligned (#333333)
 * - Slide layout: LAYOUT_WIDE (13.33 x 7.5 inches)
 * - Proper margins to prevent content from touching edges
 */
// --- NEW FUNCTION: Generate PPTX from Handlebars template and JSON ---
async function generatePPTXFromTemplate() {
    const pptx = new PptxGenJS();
    const colors = {
        primary: '#007AFF',
        subtitle: '#86868B',
        text: '#1D1D1F',
        background: '#FFFFFF',
    };
    pptx.layout = 'LAYOUT_WIDE';
    pptx.theme = { headFontFace: 'SF Pro Display', bodyFontFace: 'SF Pro Text' };
    pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: colors.background },
        margin: [0.5, 0.5, 0.5, 0.5],
    });

    // 1. Load Handlebars template
    const templateSrc = await fetch('/template.hbs').then(r => r.text());
    const template = Handlebars.compile(templateSrc);

    // 2. Load JSON data
    const slidesData = await fetch('/slides.json').then(r => r.json());

    // 3. For each slide entry, generate a slide
    slidesData.forEach((slideData, idx) => {
        const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
        // Use Handlebars to render content (not directly to pptx, but for structured fields)
        const rendered = JSON.parse(template(slideData));
        // Title
        slide.addText(rendered.title, {
            x: '5%', y: '5%', w: '90%', h: '10%',
            fontSize: 32,
            fontFace: 'SF Pro Display',
            color: colors.primary,
            bold: true,
            align: 'center',
        });
        // Subtitle
        if (rendered.subtitle) {
            slide.addText(rendered.subtitle, {
                x: '5%', y: '16%', w: '90%', h: '7%',
                fontSize: 18,
                fontFace: 'SF Pro Text',
                color: colors.subtitle,
                italic: true,
                align: 'center',
            });
        }
        // Image
        if (rendered.image) {
            slide.addImage({
                x: '30%', y: '25%', w: '40%', h: '30%',
                path: rendered.image,
            });
        }
        // Description/content
        if (rendered.description) {
            slide.addText(rendered.description, {
                x: '10%', y: '60%', w: '80%', h: '30%',
                fontSize: 16,
                fontFace: 'SF Pro Text',
                color: colors.text,
                align: 'left',
                breakLine: true,
            });
        }
    });

    // 4. Save the PPTX
    await pptx.writeFile({ fileName: 'generated_from_template.pptx' });
}

// --- WIRE UP WEBSITE BUTTON ---
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('generatePPTXBtn');
    if (btn) {
        btn.addEventListener('click', async () => {
            const status = document.getElementById('pptxStatusMsg');
            status.textContent = 'Generating PowerPoint, please wait...';
            status.style.color = '#007AFF';
            try {
                await generatePPTXFromTemplate();
                status.textContent = 'PowerPoint generated and downloaded successfully!';
                status.style.color = '#34C759';
            } catch (err) {
                status.textContent = 'Error: ' + (err?.message || err);
                status.style.color = '#FF3B30';
            }
        });
    }
});

// --- ORIGINAL FUNCTION ---
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
        
        // Set professional theme colors optimized for macOS aesthetics
        const colors = {
            primary: '#007AFF',    // Apple blue for titles and headings
            secondary: '#34C759',  // Apple green for highlights and accents
            text: '#1D1D1F',       // Apple dark gray for main text
            background: '#FFFFFF', // Clean white background
            accent: '#FF3B30',     // Apple red for important elements
            subtitle: '#86868B',   // Apple secondary gray for subtitles
            hyperlink: '#0068DA'   // Apple link blue for hyperlinks
        };
        
        // Set professional presentation properties with wide layout (optimized for macOS displays)
        pptx.layout = 'LAYOUT_WIDE';  // 13.33 x 7.5 inches for professional look
        pptx.title = metadata.topic || 'Educational Presentation';
        pptx.subject = `Grade Level: ${metadata.gradeLevel || 'Not specified'}`;
        pptx.author = 'Teaching Materials Generator';
        
        // Set theme compatible with macOS Keynote aesthetics
        pptx.theme = { headFontFace: 'SF Pro Display', bodyFontFace: 'SF Pro Text' };
        
        // Set global defaults for consistent styling with macOS aesthetics
        pptx.defineSlideMaster({
            title: 'MASTER_SLIDE',
            background: { color: colors.background },
            margin: [0.5, 0.5, 0.5, 0.5],  // Top, right, bottom, left margins in inches
            objects: [
                // Subtle gradient line in Apple style
                { 'line': { x: 0.5, y: 0.7, w: '95%', line: { color: colors.primary, width: 1.5, transparency: 20 } } }
            ],
            slideNumber: { x: 0.95, y: 0.95, fontFace: 'SF Pro Text', fontSize: 10, color: colors.subtitle }
        });
        
        /**
         * Helper function to create a clickable hyperlink text element
         * @param {object} slide - The slide to add the text to
         * @param {string} text - The text content for the hyperlink
         * @param {string} url - The URL to link to
         * @param {object} options - Position and style options
         */
        const addHyperlink = (slide, text, url, options) => {
            // Default options for hyperlinks
            const defaultOptions = {
                x: '10%', 
                y: '50%', 
                w: '80%', 
                h: '5%',
                fontSize: 16,
                color: colors.hyperlink,
                fontFace: 'SF Pro Text',  // macOS system font
                align: 'left',
                underline: true,  // Standard hyperlink styling for recognition
                valign: 'middle',
                charSpacing: 0    // Apple's default character spacing
            };
            
            // Merge user options with defaults
            const finalOptions = { ...defaultOptions, ...options };
            
            // Add hyperlink property
            finalOptions.hyperlink = { url: url };
            
            // Add the text with hyperlink
            slide.addText(text, finalOptions);
        };
        
        /**
         * Extract URLs from text and convert them to formatted links
         * @param {string} text - The text to extract links from
         * @returns {object} An object containing the text without links and an array of extracted links
         */
        function extractAndFormatLinks(text) {
            // Simple URL regex - matches http:// and https:// URLs
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const links = [];
            let match;
            
            // Find all URLs in the text
            while ((match = urlRegex.exec(text)) !== null) {
                const url = match[0];
                // Remove trailing punctuation that might be part of the URL match but not the URL
                const cleanUrl = url.replace(/[.,;:!?]$/, '');
                
                // Create a display text (shortened version of the URL)
                let displayText = cleanUrl;
                if (displayText.length > 40) {
                    displayText = displayText.substring(0, 37) + '...';
                }
                
                links.push({
                    url: cleanUrl,
                    text: displayText
                });
            }
            
            // Replace URLs with placeholders in the main text
            let processedText = text;
            if (links.length > 0) {
                processedText = text.replace(urlRegex, '[Link]');
            }
            
            return {
                text: processedText,
                links: links,
                hasLinks: links.length > 0
            };
        }
        
        // Create professional title slide
        const titleSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
        
        // Add main title with consistent 32pt font size using macOS system font
        titleSlide.addText(metadata.topic || 'Educational Presentation', {
            x: '10%', y: '35%', w: '80%', h: '15%',
            fontSize: 32,
            color: colors.primary,
            bold: true,
            align: 'center',
            fontFace: 'SF Pro Display',  // macOS system font for headings
            fit: 'shrink',              // Automatically shrink text if too long
            charSpacing: 0               // Apple's default character spacing
        });
        
        // Add subtitle with grade level - 20pt, italic using macOS system font
        titleSlide.addText(`Grade Level: ${metadata.gradeLevel || 'Not specified'}`, {
            x: '10%', y: '55%', w: '80%', h: '10%',
            fontSize: 20,
            color: colors.subtitle,
            fontFace: 'SF Pro Text',  // macOS system font for body text
            italic: true,
            align: 'center',
            charSpacing: 0           // Apple's default character spacing
        });
        
        // Add date for professional touch with macOS date format
        const today = new Date();
        // Format date in macOS style: Month Day, Year
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = today.toLocaleDateString('en-US', options);
        titleSlide.addText(`Created: ${dateStr}`, {
            x: '10%', y: '70%', w: '80%', h: '5%',
            fontSize: 14,
            color: colors.subtitle,
            fontFace: 'SF Pro Text',  // macOS system font
            align: 'center'
        });
        
        // Add hyperlinked text to title slide - demonstrates clickable URL
        addHyperlink(titleSlide, 'Click here to visit our educational resources', 'https://example.com/resources', {
            x: '10%', y: '80%', w: '80%', h: '5%',
            fontSize: 16,
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
            
            // Create a content slide with master template
            const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
            
            // Add the title - consistent 28pt, bold, centered with macOS font
            slide.addText(title, {
                x: '5%', y: '3%', w: '90%', h: '10%',
                fontSize: 28,
                color: colors.primary,
                bold: true,
                align: 'center',
                fontFace: 'SF Pro Display',  // macOS system font for headings
                fit: 'shrink',              // Prevent overflow by shrinking if needed
                shadow: { type: 'outer', blur: 3, offset: 1, angle: 45, color: 'DEDEDE', opacity: 0.25 }  // Subtle macOS style shadow
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
                    // Add video thumbnail with proper margins and sizing
                    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    console.log('Adding video thumbnail:', thumbnailUrl);
                    
                    try {
                        // Add a subtitle for the video section
                        slide.addText('Video Resource', {
                            x: '10%', y: '15%', w: '80%', h: '5%',
                            fontSize: 18,
                            italic: true,
                            color: colors.subtitle,
                            fontFace: 'Arial',
                            align: 'left'
                        });
                        
                        // Add image with 16:9 aspect ratio and proper alignment
                        slide.addImage({
                            path: thumbnailUrl,
                            x: '15%', y: '22%', w: '70%', h: '40%',
                            sizing: { type: 'contain', w: '70%', h: '40%' }
                        });
                    } catch (error) {
                        console.warn('Unable to add thumbnail:', error);
                        slide.addText('Video Thumbnail Not Available', {
                            x: '10%', y: '35%', w: '80%', h: '20%',
                            fontSize: 16, color: colors.text,
                            align: 'center'
                        });
                    }
                    
                    // Add video URL with hyperlink and proper formatting
                    slide.addText('Video URL:', {
                        x: '10%', y: '65%', w: '15%', h: '5%',
                        fontSize: 18, 
                        bold: true,
                        color: colors.text,
                        fontFace: 'Arial',
                        align: 'left'
                    });
                    
                    // Create properly styled hyperlink for the video URL
                    addHyperlink(slide, `https://www.youtube.com/watch?v=${videoId}`, `https://www.youtube.com/watch?v=${videoId}`, {
                        x: '25%', y: '65%', w: '65%', h: '5%',
                        fontSize: 16
                    });
                    
                    // Get description text (excluding the iframe)
                    const tempContent = contentElem.cloneNode(true);
                    const iframes = tempContent.querySelectorAll('iframe');
                    iframes.forEach(iframe => iframe.remove());
                    
                    const description = tempContent.textContent.trim();
                    if (description) {
                        // Add description title
                        slide.addText('Description:', {
                            x: '10%', y: '72%', w: '80%', h: '5%',
                            fontSize: 18, 
                            bold: true,
                            color: colors.text,
                            fontFace: 'Arial',
                            align: 'left'
                        });
                        
                        // Add description text - left-aligned, proper size
                        slide.addText(description, {
                            x: '10%', y: '77%', w: '80%', h: '18%',
                            fontSize: 16, 
                            color: colors.text,
                            fontFace: 'Arial',
                            align: 'left',
                            breakLine: true,
                            bullet: { type: 'bullet' }  // Add bullet points for better readability
                        });
                    }
                }
            } else {
                // This is a regular content slide
                const content = contentElem.textContent.trim();
                
                if (content && content.length > 0) {
                    console.log(`Adding content to slide ${index + 1}:`, 
                              content.substring(0, 50) + '...');
                    
                    // Split content into lines to convert into bullet points where appropriate
                    let contentLines = content.split('\n').filter(line => line.trim().length > 0);
                    let hasListItems = contentLines.some(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
                    
                    // Add subtitle for content section
                    slide.addText('Key Points:', {
                        x: '5%', y: '15%', w: '90%', h: '5%',
                        fontSize: 18,
                        italic: true,
                        color: colors.subtitle,
                        fontFace: 'Arial',
                        align: 'left'
                    });
                    
                    if (hasListItems) {
                        // Process as bullet points
                        contentLines.forEach((line, lineIdx) => {
                            // Clean up the line
                            let cleanLine = line.trim().replace(/^[-•]\s*/, '');
                            
                            // Skip empty lines
                            if (cleanLine.length === 0) return;
                            
                            // Calculate position based on number of lines (dynamic positioning)
                            const yPos = 22 + (lineIdx * 8); // 8% vertical space per bullet point
                            
                            slide.addText(cleanLine, {
                                x: '8%', y: `${yPos}%`, w: '84%', h: '8%',
                                fontSize: 18,
                                color: colors.text,
                                fontFace: 'Arial',
                                align: 'left',
                                bullet: { type: 'bullet' },
                                fit: 'shrink'  // Shrink text if too long for the line
                            });
                        });
                    } else {
                        // Process text to find and convert URLs to clickable links
                        const processedContent = extractAndFormatLinks(content);
                        
                        if (processedContent.hasLinks) {
                            // Add regular text first
                            slide.addText(processedContent.text, {
                                x: '8%', y: '22%', w: '84%', h: '60%',
                                fontSize: 18,
                                color: colors.text,
                                fontFace: 'Arial',
                                align: 'left',
                                breakLine: true,
                                lineSpacing: 16  // Add line spacing for readability
                            });
                            
                            // Add a section for references/links
                            slide.addText('References:', {
                                x: '8%', y: '82%', w: '84%', h: '5%',
                                fontSize: 18,
                                bold: true,
                                color: colors.text,
                                fontFace: 'Arial',
                                align: 'left'
                            });
                            
                            // Add each detected link as a clickable hyperlink
                            processedContent.links.forEach((link, idx) => {
                                addHyperlink(slide, `${idx + 1}. ${link.text}`, link.url, {
                                    x: '8%', y: `${87 + (idx * 4)}%`, w: '84%', h: '4%',
                                    fontSize: 16
                                });
                            });
                        } else {
                            // Just add the regular text if no links
                            slide.addText(content, {
                                x: '8%', y: '22%', w: '84%', h: '70%',
                                fontSize: 18,
                                color: colors.text,
                                fontFace: 'Arial',
                                align: 'left',
                                breakLine: true,
                                lineSpacing: 16  // Add line spacing for readability
                            });
                        }
                    }
                } else {
                    // Style for empty slides with professional placeholder
                    slide.addText('No content available for this slide.', {
                        x: '10%', y: '45%', w: '80%', h: '10%',
                        fontSize: 18, 
                        color: colors.subtitle,
                        fontFace: 'Arial',
                        align: 'center',
                        italic: true
                    });
                    
                    // Add a example hyperlink on empty slides
                    addHyperlink(slide, 'Click to find educational content examples', 'https://example.com/content-samples', {
                        x: '10%', y: '60%', w: '80%', h: '5%',
                        fontSize: 16,
                        align: 'center'
                    });
                }
            }
        });
        
        // Apply final formatting optimization before saving
        console.log('Applying final formatting optimizations...');
        
        // Ensure consistent slide formatting across all slides
        pptx.slideLayouts.forEach(layout => {
            // Set consistent slide formatting
            if (layout) {
                layout.margin = [0.5, 0.5, 0.5, 0.5]; // Consistent margins
            }
        });
        
        // Generate filename with date for better organization
        const dateFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const safeFilename = metadata.topic 
            ? `${metadata.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateFormatted}`
            : `presentation_${dateFormatted}`;
        
        console.log('Saving PowerPoint with perfect formatting as:', `${safeFilename}.pptx`);
        
        // Save with high-quality formatting options
        const saveOptions = {
            fileName: `${safeFilename}.pptx`,
            compression: true,      // Optimize file size
            embedImages: true       // Ensure images are properly embedded
        };
        
        // Save the PowerPoint file
        await pptx.writeFile(saveOptions);
        console.log('PowerPoint saved successfully with enhanced formatting');
        
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
