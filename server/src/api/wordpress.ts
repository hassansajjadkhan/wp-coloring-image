import { Router } from 'express';
import { getDb } from '../db/database';
import {
  getCategoryId,
  getCategories,
  publishPost,
  updatePostMeta,
  testWordPressConnection,
} from '../services/wordpress';
import { generateColoringPagePdf } from '../services/pdf';

const router = Router();

// Test WordPress connectivity
router.get('/test-connection', async (req, res) => {
  try {
    const result = await testWordPressConnection();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// Diagnostic endpoint - test post creation directly
router.post('/test-create-post', async (req, res) => {
  try {
    console.log('🧪 Testing direct post creation...');
    
    const testPost = {
      title: 'Test Post - ' + new Date().toISOString(),
      content: 'This is a test post to check if REST API can create posts.',
      status: 'draft',
      categories: [1], // Default "Uncategorized"
    };

    console.log('📝 Attempting to create test post:', testPost);
    
    // Try to import and use publishPost directly for testing
    const { publishPost: testPublishPost } = await import('../services/wordpress');
    
    // Or use axios directly
    const axios = require('axios');
    const { Buffer } = require('buffer');
    
    const username = process.env.WORDPRESS_USERNAME || '';
    const password = process.env.WORDPRESS_PASSWORD || '';
    const authString = username && password ? `${username}:${password}` : '';
    const authHeader = authString ? Buffer.from(authString).toString('base64') : '';
    
    const testClient = axios.create({
      baseURL: `${process.env.WORDPRESS_URL}/wp-json/wp/v2`,
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    const response = await testClient.post('/posts', testPost);
    
    console.log('✅ Test post created successfully!');
    console.log('   Post ID:', response.data.id);
    console.log('   Post URL:', response.data.link);
    
    res.json({
      status: 'success',
      message: 'Test post created successfully',
      postId: response.data.id,
      postUrl: response.data.link,
    });
  } catch (error: any) {
    console.error('❌ Test post creation failed');
    console.error('   Status:', error.response?.status);
    console.error('   Code:', error.response?.data?.code);
    console.error('   Message:', error.response?.data?.message);
    
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
      details: error.response?.data?.data,
    });
  }
});

// Get WordPress categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get approved pages ready to publish
router.get('/approved-pages', async (req, res) => {
  try {
    const db = getDb();
    const pages = db.prepare(
      `SELECT ap.*, gp.image_url 
       FROM approved_pages ap
       JOIN generated_pages gp ON ap.page_id = gp.id
       WHERE ap.published = 0
       ORDER BY ap.created_at DESC`
    ).all();

    res.json(pages);
  } catch (error: any) {
    console.error('Get approved pages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Publish page to WordPress
router.post('/publish-page', async (req, res) => {
  try {
    const { approvedPageId } = req.body;

    if (!approvedPageId) {
      return res.status(400).json({ error: 'Missing approvedPageId' });
    }

    console.log('📤 Publishing page:', approvedPageId);
    const db = getDb();

    const approvedPage = db.prepare(
      `SELECT ap.*, gp.image_url 
       FROM approved_pages ap
       JOIN generated_pages gp ON ap.page_id = gp.id
       WHERE ap.id = ?`
    ).get(approvedPageId);

    if (!approvedPage) {
      console.error('❌ Page not found:', approvedPageId);
      return res.status(404).json({ error: 'Page not found' });
    }

    console.log('✅ Found page:', approvedPage.title);

    // Get category ID
    console.log('📂 Getting category ID for:', approvedPage.category);
    const categoryId = await getCategoryId(approvedPage.category);
    console.log('✅ Category ID:', categoryId);

    // Generate PDF
    let pdfBuffer;
    try {
      console.log('📄 Generating PDF for:', approvedPage.title);
      pdfBuffer = await generateColoringPagePdf(
        approvedPage.image_url,
        approvedPage.title
      );
      console.log('✅ PDF generated:', pdfBuffer.length, 'bytes');
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      pdfBuffer = Buffer.from('');
    }

    // Create post content with download button
    const content = `
<p>${approvedPage.title}</p>
<img src="${approvedPage.image_url}" alt="${approvedPage.alt_text}" title="${approvedPage.title}" />
<p><a href="#download" class="coloring-download-btn" data-pdf-id="${approvedPageId}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; border-radius: 50px; text-decoration: none; font-weight: bold;">📥 Download Coloring Page</a></p>
    `;

    // Publish to WordPress
    console.log('🚀 Publishing to WordPress...');
    const postId = await publishPost(
      approvedPage.title,
      content,
      categoryId,
      approvedPage.slug,
      {
        seoTitle: approvedPage.seo_title,
        seoDescription: approvedPage.seo_description,
      }
    );
    console.log('✅ Post published with ID:', postId);

    // Update post meta with SEO data
    console.log('📝 Updating post meta with SEO data...');
    await updatePostMeta(postId, {
      '_yoast_wpseo_title': approvedPage.seo_title || approvedPage.title,
      '_yoast_wpseo_metadesc': approvedPage.seo_description || '',
    });
    console.log('✅ Meta data updated');

    // Mark as published
    const updatePublished = db.prepare(
      'UPDATE approved_pages SET published = 1, wp_post_id = ?, published_at = ? WHERE id = ?'
    );
    updatePublished.run(postId, new Date().toISOString(), approvedPageId);
    console.log('✅ Database updated - Page marked as published');

    res.json({ postId, status: 'published' });
  } catch (error: any) {
    console.error('❌ Publish page error:', error.message);
    console.error('📋 Full error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-publish approved pages (called by scheduler)
export async function publishApprovedPages() {
  try {
    const db = getDb();

    // Get scheduler settings
    const settings = db.prepare(
      'SELECT daily_limit FROM scheduler_settings WHERE id = 1'
    ).get();
    const limit = (settings as any)?.daily_limit || 50;

    // Get unpublished approved pages
    const pages = db.prepare(
      `SELECT ap.*, gp.image_url 
       FROM approved_pages ap
       JOIN generated_pages gp ON ap.page_id = gp.id
       WHERE ap.published = 0
       LIMIT ?`
    ).all(limit);

    console.log(`📤 Publishing ${pages.length} pages...`);

    const updatePublished = db.prepare(
      'UPDATE approved_pages SET published = 1, wp_post_id = ?, published_at = ? WHERE id = ?'
    );

    for (const page of pages) {
      try {
        const categoryId = await getCategoryId((page as any).category);

        const content = `
<p>${(page as any).title}</p>
<img src="${(page as any).image_url}" alt="${(page as any).alt_text}" title="${(page as any).title}" />
<p><a href="#download" class="coloring-download-btn" data-pdf-id="${(page as any).id}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; border-radius: 50px; text-decoration: none; font-weight: bold;">📥 Download Coloring Page</a></p>
        `;

        const postId = await publishPost(
          (page as any).title,
          content,
          categoryId,
          (page as any).slug,
          {
            seoTitle: (page as any).seo_title,
            seoDescription: (page as any).seo_description,
          }
        );

        updatePublished.run(postId, new Date().toISOString(), (page as any).id);

        console.log(`✅ Published: ${(page as any).title} (Post #${postId})`);
      } catch (error) {
        console.error(`Failed to publish ${(page as any).title}:`, error);
      }
    }
  } catch (error) {
    console.error('Auto-publish error:', error);
  }
}

export default router;
