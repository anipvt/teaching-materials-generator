document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generatorForm');
    const outputCard = document.getElementById('outputCard');
    const resultContent = document.getElementById('resultContent');
    const loading = document.getElementById('loading');
    const downloadBtn = document.getElementById('downloadBtn');

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show output card and loading spinner
        outputCard.style.display = 'block';
        loading.style.display = 'flex';
        resultContent.style.display = 'none';
        downloadBtn.style.display = 'none';
        
        // Scroll to output card
        outputCard.scrollIntoView({ behavior: 'smooth' });
        
        // Get form data
        const formData = {
            semester: document.getElementById('semester').value,
            subject: document.getElementById('subject').value,
            classNumber: document.getElementById('classNumber').value,
            topic: document.getElementById('topic').value,
            difficultyLevel: document.getElementById('difficultyLevel').value
        };
        
        try {
            // Send request to API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate content');
            }
            
            const data = await response.json();
            
            // Process the response
            resultContent.innerHTML = formatResponse(data.result);
            
            // Hide loading spinner and show result
            loading.style.display = 'none';
            resultContent.style.display = 'block';
            downloadBtn.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            resultContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            loading.style.display = 'none';
            resultContent.style.display = 'block';
        }
    });
    
    // Handle download button
    downloadBtn.addEventListener('click', () => {
        const element = document.getElementById('resultContent');
        const formData = {
            semester: document.getElementById('semester').value,
            subject: document.getElementById('subject').value,
            topic: document.getElementById('topic').value,
        };
        
        const filename = `${formData.subject}_${formData.topic}_Materials.pdf`;
        
        // Options for html2pdf
        const opt = {
            margin: 1,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        };
        
        // Generate PDF
        html2pdf().set(opt).from(element).save();
    });
    
    // Format the API response with markdown-like syntax
    function formatResponse(text) {
        if (!text) return '';
        
        // Convert line breaks to <br>
        let formatted = text.replace(/\n/g, '<br>');
        
        // Convert headers (# Header)
        formatted = formatted.replace(/# (.*?)<br>/g, '<h1>$1</h1>');
        formatted = formatted.replace(/## (.*?)<br>/g, '<h2>$1</h2>');
        formatted = formatted.replace(/### (.*?)<br>/g, '<h3>$1</h3>');
        
        // Convert bullet points
        formatted = formatted.replace(/- (.*?)<br>/g, '<li>$1</li>');
        formatted = formatted.replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
        formatted = formatted.replace(/<\/ul><ul>/g, '');
        
        // Convert numbered lists
        formatted = formatted.replace(/\d+\. (.*?)<br>/g, '<li>$1</li>');
        
        // Convert bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert links
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        return formatted;
    }
});
