import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database';
import {
  generateColoringPageIdeas,
  generateColoringPageImage,
  generateSeoContent,
} from '../services/openai';
import { generateBatchPdf } from '../services/pdf.js';

const router = Router();

// Generate ideas for a prompt
router.post('/generate-ideas', async (req, res) => {
  try {
    const { quantity, style } = req.body;

    if (!quantity || !style) {
      return res.status(400).json({ error: 'Missing quantity or style' });
    }

    const ideas = await generateColoringPageIdeas(parseInt(quantity), style);

    res.json({ ideas });
  } catch (error: any) {
    console.error('Ideas generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create prompt and generate pages
router.post('/create-prompt', async (req, res) => {
  try {
    const { title, quantity, style, category, ideas } = req.body;

    if (!title || !quantity || !style || !category || !ideas) {
      return res
        .status(400)
        .json({ error: 'Missing required fields' });
    }

    const promptId = uuidv4();
    const db = getDb();

    // Save prompt
    const insertPrompt = db.prepare(
      'INSERT INTO prompts (id, title, quantity, style, category, status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertPrompt.run(promptId, title, quantity, style, category, 'generating');

    // Start generating pages asynchronously
    (async () => {
      try {
        const pages = [];
        const insertPage = db.prepare(
          'INSERT INTO generated_pages (id, prompt_id, page_number, idea, image_url, status) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const updatePrompt = db.prepare(
          'UPDATE prompts SET status = ? WHERE id = ?'
        );

        for (let i = 0; i < ideas.length; i++) {
          const idea = ideas[i];
          const pageId = uuidv4();

          // Generate image
          let imageUrl = '';
          try {
            imageUrl = await generateColoringPageImage(idea, promptId);
            console.log(`✅ Generated image ${i + 1}/${ideas.length}: ${imageUrl}`);
          } catch (error) {
            console.error(`❌ Failed to generate image for idea ${i + 1}:`, error);
          }

          // Save generated page
          console.log(`💾 Saving page ${i + 1} with image URL: ${imageUrl || '(empty)'}`);
          insertPage.run(pageId, promptId, i + 1, idea, imageUrl, 'pending_review');

          pages.push({ id: pageId, title: `Page ${i + 1}`, imageUrl });
        }

        // Update prompt status
        updatePrompt.run('generated', promptId);

        console.log(`✅ Generated all ${ideas.length} pages for prompt ${promptId}`);
      } catch (error) {
        console.error('Page generation error:', error);
        const updatePrompt = db.prepare(
          'UPDATE prompts SET status = ? WHERE id = ?'
        );
        updatePrompt.run('error', promptId);
      }
    })();

    res.json({ promptId, status: 'generating' });
  } catch (error: any) {
    console.error('Create prompt error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get prompt with generated pages
router.get('/prompt/:promptId', async (req, res) => {
  try {
    const db = getDb();
    const prompt = db.prepare(
      'SELECT * FROM prompts WHERE id = ?'
    ).get(req.params.promptId);

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Get generated pages with approved page data if available
    const pages = db.prepare(
      `SELECT 
        gp.*,
        ap.id as approved_id,
        ap.title as approved_title,
        ap.seo_title,
        ap.seo_description,
        ap.alt_text,
        ap.slug,
        ap.published
       FROM generated_pages gp
       LEFT JOIN approved_pages ap ON gp.id = ap.page_id
       WHERE gp.prompt_id = ? 
       ORDER BY gp.page_number`
    ).all(req.params.promptId);

    res.json({ prompt, pages });
  } catch (error: any) {
    console.error('Get prompt error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve page
router.post('/approve-page', async (req, res) => {
  try {
    const {
      pageId,
      title,
      seoTitle,
      seoDescription,
      altText,
      category,
    } = req.body;

    if (!pageId || !title || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const approvedId = uuidv4();
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const db = getDb();

    // Get page image URL
    const page = db.prepare(
      'SELECT image_url FROM generated_pages WHERE id = ?'
    ).get(pageId);

    // Save approved page
    const insertApproved = db.prepare(
      `INSERT INTO approved_pages 
       (id, page_id, title, slug, seo_title, seo_description, alt_text, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertApproved.run(approvedId, pageId, title, slug, seoTitle, seoDescription, altText, category);

    // Update generated page status
    const updatePage = db.prepare(
      'UPDATE generated_pages SET status = ? WHERE id = ?'
    );
    updatePage.run('approved', pageId);

    res.json({ approvedId, status: 'approved' });
  } catch (error: any) {
    console.error('Approve page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject page with feedback
router.post('/reject-page', async (req, res) => {
  try {
    const { pageId, feedback } = req.body;

    if (!pageId) {
      return res.status(400).json({ error: 'Missing pageId' });
    }

    const db = getDb();

    const updatePage = db.prepare(
      'UPDATE generated_pages SET status = ?, feedback = ? WHERE id = ?'
    );
    updatePage.run('rejected', feedback || '', pageId);

    res.json({ status: 'rejected' });
  } catch (error: any) {
    console.error('Reject page error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate SEO content
router.post('/generate-seo', async (req, res) => {
  try {
    const { title, idea } = req.body;

    if (!title || !idea) {
      return res.status(400).json({ error: 'Missing title or idea' });
    }

    const seoContent = await generateSeoContent(title, idea);
    res.json(seoContent);
  } catch (error: any) {
    console.error('Generate SEO error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
