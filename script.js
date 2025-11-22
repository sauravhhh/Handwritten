// Global variables
let canvas = document.getElementById('previewCanvas');
let ctx = canvas.getContext('2d');
let selectedPaperStyle = 'plain';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    generateHandwrittenNotes();
    setupEventListeners();
});

function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Text input
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', generateHandwrittenNotes);
        console.log('Text input listener attached');
    }
    
    // Font style
    const fontStyle = document.getElementById('fontStyle');
    if (fontStyle) {
        fontStyle.addEventListener('change', function() {
            updateFontPreview();
            generateHandwrittenNotes();
        });
        console.log('Font style listener attached');
    }
    
    // Font size
    const fontSize = document.getElementById('fontSize');
    if (fontSize) {
        fontSize.addEventListener('input', function(e) {
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
            generateHandwrittenNotes();
        });
        console.log('Font size listener attached');
    }
    
    // Line height
    const lineHeight = document.getElementById('lineHeight');
    if (lineHeight) {
        lineHeight.addEventListener('input', function(e) {
            document.getElementById('lineHeightValue').textContent = e.target.value;
            generateHandwrittenNotes();
        });
        console.log('Line height listener attached');
    }
    
    // Colors
    const penColor = document.getElementById('penColor');
    if (penColor) {
        penColor.addEventListener('change', generateHandwrittenNotes);
        console.log('Pen color listener attached');
    }
    
    const bgColor = document.getElementById('bgColor');
    if (bgColor) {
        bgColor.addEventListener('change', generateHandwrittenNotes);
        console.log('Background color listener attached');
    }
    
    // Paper style buttons
    const paperStyleBtns = document.querySelectorAll('.paper-style-btn');
    if (paperStyleBtns) {
        paperStyleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                paperStyleBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedPaperStyle = this.dataset.style;
                generateHandwrittenNotes();
            });
        });
        console.log('Paper style listeners attached');
    }
    
    // Image size
    const imageSize = document.getElementById('imageSize');
    if (imageSize) {
        imageSize.addEventListener('change', function(e) {
            const customInputs = document.getElementById('customSizeInputs');
            if (e.target.value === 'custom') {
                customInputs.classList.remove('hidden');
            } else {
                customInputs.classList.add('hidden');
                const [width, height] = e.target.value.split('x');
                canvas.width = parseInt(width);
                canvas.height = parseInt(height);
                generateHandwrittenNotes();
            }
        });
        console.log('Image size listener attached');
    }
    
    // Custom size inputs
    const customWidth = document.getElementById('customWidth');
    if (customWidth) {
        customWidth.addEventListener('input', updateCustomSize);
        console.log('Custom width listener attached');
    }
    
    const customHeight = document.getElementById('customHeight');
    if (customHeight) {
        customHeight.addEventListener('input', updateCustomSize);
        console.log('Custom height listener attached');
    }
    
    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            console.log('Generate button clicked');
            generateHandwrittenNotes();
        });
        console.log('Generate button listener attached');
    } else {
        console.error('Generate button not found');
    }
    
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            console.log('Download button clicked');
            // First ensure the canvas is generated
            generateHandwrittenNotes();
            // Then download after a short delay to ensure canvas is ready
            setTimeout(() => {
                downloadImage('jpeg');
            }, 100);
        });
        console.log('Download button listener attached');
    } else {
        console.error('Download button not found');
    }
}

function updateFontPreview() {
    const fontStyle = document.getElementById('fontStyle').value;
    const preview = document.getElementById('fontPreview');
    if (preview) {
        preview.className = `font-preview font-${fontStyle.toLowerCase().replace(' ', '').replace('-', '')}`;
    }
}

function updateCustomSize() {
    const width = parseInt(document.getElementById('customWidth').value);
    const height = parseInt(document.getElementById('customHeight').value);
    if (canvas) {
        canvas.width = width;
        canvas.height = height;
        generateHandwrittenNotes();
    }
}

function generateHandwrittenNotes() {
    console.log('Generating handwritten notes');
    
    if (!canvas || !ctx) {
        console.error('Canvas or context not available');
        return;
    }
    
    const text = document.getElementById('textInput').value;
    const fontStyle = document.getElementById('fontStyle').value;
    const fontSize = parseInt(document.getElementById('fontSize').value);
    const lineHeight = parseFloat(document.getElementById('lineHeight').value);
    const penColor = document.getElementById('penColor').value;
    const bgColor = document.getElementById('bgColor').value;
    
    console.log('Parameters:', { text, fontStyle, fontSize, lineHeight, penColor, bgColor });
    
    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw paper style
    drawPaperStyle();
    
    // Set text properties
    ctx.font = `${fontSize}px ${fontStyle}`;
    ctx.fillStyle = penColor;
    ctx.textBaseline = 'top';
    
    // Calculate line height in pixels
    const lineHeightPx = fontSize * lineHeight;
    
    // Split text into lines
    const lines = text.split('\n');
    const maxWidth = canvas.width - 80; // 40px padding on each side
    
    let y = 40; // Starting y position
    
    lines.forEach(line => {
        if (line.trim() === '') {
            y += lineHeightPx;
            return;
        }
        
        // Word wrap
        const words = line.split(' ');
        let currentLine = '';
        
        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                // Draw current line
                drawTextWithVariation(currentLine.trim(), 40, y, fontSize, fontStyle, penColor);
                y += lineHeightPx;
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        
        // Draw remaining line
        if (currentLine.trim() !== '') {
            drawTextWithVariation(currentLine.trim(), 40, y, fontSize, fontStyle, penColor);
            y += lineHeightPx;
        }
    });
    
    console.log('Handwritten notes generated');
}

function drawTextWithVariation(text, x, y, fontSize, fontFamily, color) {
    // Add slight variations to make it look more natural
    const words = text.split(' ');
    let currentX = x;
    
    words.forEach((word, index) => {
        // Slight random variations
        const yOffset = (Math.random() - 0.5) * 2;
        const sizeVariation = fontSize + (Math.random() - 0.5) * 2;
        const rotation = (Math.random() - 0.5) * 0.05; // Small rotation variation
        
        ctx.save();
        ctx.font = `${sizeVariation}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.translate(currentX, y + yOffset);
        ctx.rotate(rotation);
        ctx.fillText(word, 0, 0);
        ctx.restore();
        
        // Add space
        currentX += ctx.measureText(word + ' ').width;
    });
}

function drawPaperStyle() {
    if (selectedPaperStyle === 'lined') {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let y = 40; y < canvas.height; y += 32) {
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(canvas.width - 40, y);
            ctx.stroke();
        }
    } else if (selectedPaperStyle === 'grid') {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 40; y < canvas.height; y += 32) {
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(canvas.width - 40, y);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let x = 40; x < canvas.width; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 40);
            ctx.lineTo(x, canvas.height - 40);
            ctx.stroke();
        }
    }
}

function downloadImage(format) {
    console.log('Downloading image as', format);
    
    if (!canvas) {
        console.error('Canvas not available for download');
        alert('Canvas not available. Please try generating the image first.');
        return;
    }
    
    try {
        // Check if canvas has content
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let hasContent = false;
        
        // Check if any pixel is not the background color
        for (let i = 0; i < data.length; i += 4) {
            // Skip alpha channel (i+3)
            if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255) {
                hasContent = true;
                break;
            }
        }
        
        if (!hasContent) {
            console.error('Canvas appears to be empty');
            alert('The canvas appears to be empty. Please try generating the image first.');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        if (format === 'png') {
            link.download = `handwritten-notes-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
        } else {
            link.download = `handwritten-notes-${timestamp}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
        }
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Download completed');
        alert('Image downloaded successfully!');
    } catch (error) {
        console.error('Error during download:', error);
        alert('Error downloading image. Please try again.');
    }
                               }
