# WordPress Download Button Setup

## Overview

The coloring pages include a round download button that allows visitors to download the PDF files.

## How It Works

1. When a page is approved & published, a download button is added to the post content
2. The button has a unique ID linking to the approved page
3. You need a download handler on WordPress to serve the PDFs

## Setup Options

### Option 1: Use Direct Image Download (Simple)

No additional setup needed! The system includes:
- Button HTML in post content
- Button styling (round, green, 50px)
- Data attributes for tracking

The images are hosted on OpenAI CDN, so they download automatically.

### Option 2: Create PDF Files (Advanced)

To serve actual PDF files:

1. **Modify API to save PDFs**

In `server/src/api/wordpress.ts`, add:

```typescript
import fs from 'fs';
import path from 'path';

export async function savePdfFile(
  approvedPageId: string,
  pdfBuffer: Buffer
): Promise<string> {
  const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  
  const filename = `coloring-${approvedPageId}.pdf`;
  const filepath = path.join(pdfDir, filename);
  
  fs.writeFileSync(filepath, pdfBuffer);
  return `/pdfs/${filename}`;
}
```

2. **Update publish-page endpoint**

```typescript
const pdfUrl = await savePdfFile(approvedPageId, pdfBuffer);

const content = `
<p>${approvedPage.title}</p>
<img src="${approvedPage.image_url}" alt="${approvedPage.alt_text}" />
<p><a href="${pdfUrl}" download class="coloring-download-btn">📥 Download Coloring Page</a></p>
`;
```

3. **Deploy pdfs folder to WordPress**

Add to WordPress `.htaccess` or upload folder:

```apache
<FilesMatch "\.pdf$">
  Header set Content-Disposition "attachment"
  Header set Content-Type "application/pdf"
</FilesMatch>
```

### Option 3: WordPress Plugin (Most Flexible)

Create a custom WordPress plugin to handle downloads:

**File: wp-content/plugins/coloring-page-downloader/coloring-downloader.php**

```php
<?php
/*
Plugin Name: Coloring Page Downloader
Description: Handle coloring page PDF downloads
Version: 1.0.0
*/

add_action('wp_enqueue_scripts', function() {
    wp_register_script('coloring-download', 
        plugin_dir_url(__FILE__) . 'js/download.js',
        ['jquery'], '1.0.0', true);
    wp_enqueue_script('coloring-download');
});

add_action('wp_ajax_download_coloring_page', function() {
    $page_id = sanitize_text_field($_POST['page_id']);
    
    // Get PDF from your API or database
    $pdf_url = get_post_meta(get_the_ID(), '_coloring_pdf_url', true);
    
    if ($pdf_url) {
        // Redirect to PDF
        wp_redirect($pdf_url);
    }
    
    wp_die();
});

add_action('wp_ajax_nopriv_download_coloring_page', function() {
    do_action('wp_ajax_download_coloring_page');
});
?>
```

**File: js/download.js**

```javascript
jQuery(document).ready(function($) {
    $('.coloring-download-btn').on('click', function(e) {
        e.preventDefault();
        
        const pageId = $(this).data('pdf-id');
        
        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: {
                action: 'download_coloring_page',
                page_id: pageId
            },
            success: function(response) {
                // PDF download started
            }
        });
    });
});
```

## Button Styling

The system includes a pre-styled button:

```css
.coloring-download-btn {
    display: inline-block;
    padding: 12px 24px;
    background-color: #4CAF50;
    color: white;
    border-radius: 50px;  /* Round button */
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s ease;
    margin-top: 20px;
}

.coloring-download-btn:hover {
    background-color: #45a049;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

Add to WordPress custom CSS (Appearance → Customize → Additional CSS):

```css
.coloring-download-btn {
    display: inline-block;
    padding: 12px 24px;
    background-color: #4CAF50;
    color: white;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s ease;
    margin: 20px 0;
    border: none;
    cursor: pointer;
}

.coloring-download-btn:hover {
    background-color: #45a049;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

## Tracking Downloads

Add GA4 tracking to button:

```html
<a href="#download" 
   class="coloring-download-btn" 
   data-pdf-id="${approvedPageId}"
   onclick="gtag('event', 'download', {file_name: '${title}'})">
    📥 Download Coloring Page
</a>
```

## Mobile Responsive

The button is already responsive and works on all devices:
- **Desktop**: Full-size button
- **Tablet**: Adjusted padding
- **Mobile**: Full-width or stacked

## Testing

1. Publish a test coloring page
2. Visit the post on your WordPress site
3. Click the download button
4. Verify PDF downloads correctly

## Troubleshooting

### Button Not Showing
- Check post content includes the button HTML
- Verify CSS is loaded
- Check browser console for errors

### Download Not Working
- Verify file exists at URL
- Check file permissions (755)
- Test direct file access
- Check browser's download settings

### PDF Not Generated
- Verify OpenAI API key is valid
- Check image generation succeeded
- Review API logs for errors

## Advanced: Custom Branding

Add watermark to PDFs before download:

```typescript
import PDFDocument from 'pdfkit';

export async function addWatermarkToPdf(
  pdfBuffer: Buffer,
  watermark: string
): Promise<Buffer> {
  // Add watermark text/image to PDF
  // Returns watermarked buffer
}
```

---

For more help, see README.md or contact support.
