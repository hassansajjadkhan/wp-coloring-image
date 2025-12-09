import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isMockMode(): boolean {
  const mockModeEnv = process.env.MOCK_MODE;
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  // If MOCK_MODE is explicitly set to 'false', use real mode
  if (mockModeEnv === 'false') {
    console.log('✅ Real mode enabled (MOCK_MODE=false, API Key present)');
    return false;
  }
  
  // If MOCK_MODE is explicitly set to 'true', use mock mode
  if (mockModeEnv === 'true') {
    console.log('🎭 Mock mode enabled (MOCK_MODE=true)');
    return true;
  }
  
  // If no MOCK_MODE set, use API key presence as indicator
  if (!hasApiKey) {
    console.log('🎭 Mock mode enabled (no API key found)');
    return true;
  }
  
  console.log('✅ Real mode enabled (API key found)');
  return false;
}

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-mock-key',
  });
}

export async function generateColoringPageIdeas(
  quantity: number,
  style: string,
  existingIdeas: string[] = []
): Promise<string[]> {
  // Mock mode - return sample ideas
  if (isMockMode()) {
    const mockIdeas: Record<string, string[]> = {
      christmas: [
        'Santa Claus with reindeer flying over snowy houses',
        'Christmas tree decorated with ornaments and presents underneath',
        'Snowman with a carrot nose and coal eyes',
        'Christmas wreath with holly and red bow',
        'Gingerbread house with candy decorations',
        'Christmas stocking filled with toys and candy canes',
      ],
      animals: [
        'Friendly lion with a big mane',
        'Cute butterfly with detailed wing patterns',
        'Playful monkey swinging from vines',
        'Striped zebra standing in grass',
        'Wise owl perched on a branch',
        'Sleeping cat curled up in a cozy bed',
      ],
      fantasy: [
        'Magical unicorn with a spiraling horn',
        'Dragon breathing colorful flames',
        'Fairy with delicate wings in a forest',
        'Enchanted castle on a hilltop',
        'Phoenix rising from flames',
        'Mermaid swimming with fish in coral reef',
      ],
      nature: [
        'Sunflower field with bees and butterflies',
        'Mountain landscape with trees and stream',
        'Ocean wave with surfer riding it',
        'Forest clearing with deer and woodland creatures',
        'Garden with blooming flowers and vines',
        'Desert with cacti and sand dunes',
      ],
    };

    const themeLower = style.toLowerCase();
    let ideas = mockIdeas[themeLower] || mockIdeas.animals;
    
    // Filter out existing ideas
    ideas = ideas.filter(idea => !existingIdeas.includes(idea));
    
    // Return requested quantity
    return ideas.slice(0, quantity);
  }

  const prompt = `You are a creative designer specializing in coloring pages. Generate ${quantity} unique and creative ideas for coloring pages in "${style}" style.

Previously generated ideas (avoid these):
${existingIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}

Requirements:
- Each idea should be specific and detailed
- Ideas must be suitable for coloring pages (line art)
- Make them diverse and interesting
- Each idea should be 1-2 sentences max

Format your response as a numbered list only. Nothing else.`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: 2000,
  });

  const ideas = (response.choices[0]?.message?.content || '')
    .split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0);

  return ideas;
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    console.log(`📡 Fetching image from: ${url.substring(0, 80)}...`);
    
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    console.log(`💾 Writing ${response.data.length} bytes to: ${filepath}`);
    fs.writeFileSync(filepath, response.data);
    console.log(`✅ File written successfully`);
  } catch (error) {
    console.error(`❌ Download error:`, error instanceof Error ? error.message : error);
    // Clean up partial file if it exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    throw error;
  }
}

export async function generateColoringPageImage(idea: string, promptId: string): Promise<string> {
  // Mock mode - return a placeholder image URL
  if (isMockMode()) {
    console.log('🎭 MOCK_MODE: Returning placeholder image');
    // Using placeholder service
    return `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(idea.substring(0, 30))}`;
  }

  console.log('🎨 Real mode: Generating image from OpenAI for:', idea.substring(0, 50));

  const prompt = `Create a children's coloring page drawing for: "${idea}"

STYLE REQUIREMENTS (CRITICAL):
- Pure black line art with CLEAN, CLEAR outlines
- NO shading, gradients, or filled areas
- Simple, bold strokes suitable for children to color
- High contrast black lines on pure white background
- Similar style to classic children's coloring books
- Engaging and fun for kids ages 4-12
- Suitable for printing on A4 paper
- Medium complexity - not too simple, not too intricate
- Include some interesting details but keep it manageable

IMPORTANT - UNIQUENESS:
- Create a UNIQUE and ORIGINAL design
- Do NOT copy or resemble existing coloring pages
- Bring your own creative interpretation
- Use different angles, compositions, and arrangements
- Vary the scene layout and character positioning
- Include unique decorative elements and patterns

AVOID:
- Photorealism or complex shading
- Gradient or tone variations
- Watercolor or artistic effects
- Too dense or cluttered designs
- Very small details that are hard to color
- Generic or overdone compositions

The design should be a single main illustration that fills most of the page.`;

  try {
    const response = await getOpenAI().images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    const imageUrl = response.data?.[0]?.url || '';
    console.log('✅ OpenAI returned URL:', imageUrl.substring(0, 50) + '...');
    
    if (!imageUrl) {
      throw new Error('Failed to generate image from OpenAI');
    }

    // Create images directory if it doesn't exist
    const imagesDir = path.join(__dirname, '../../data/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('📁 Created images directory:', imagesDir);
    }

    // Generate unique filename based on prompt and timestamp
    const timestamp = Date.now();
    const sanitizedIdea = idea.substring(0, 30).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${promptId}-${sanitizedIdea}-${timestamp}.png`;
    const filepath = path.join(imagesDir, filename);

    console.log('📥 Downloading image to:', filename);
    // Download and save the image
    await downloadImage(imageUrl, filepath);

    console.log('✅ Image saved successfully:', filename);
    // Return relative path that can be served
    return `/images/${filename}`;
  } catch (error) {
    console.error('❌ Image generation error:', error);
    throw error;
  }
}

export async function generateSeoContent(
  title: string,
  idea: string
): Promise<{
  seoTitle: string;
  seoDescription: string;
  altText: string;
}> {
  // Mock mode - generate mock SEO content in Dutch
  if (isMockMode()) {
    return {
      seoTitle: `${title} - Gratis Kleurplaat`.substring(0, 60),
      seoDescription: `Kleurplaat ${title} om uit te printen. Gratis kleurplaten voor kinderen.`.substring(0, 160),
      altText: `${title} kleurplaat voor kinderen`.substring(0, 125),
    };
  }

  const prompt = `Genereer SEO-content voor een kleurplaat met deze titel: "${title}"
Idee: "${idea}"

Verstrek:
1. SEO Titel (max 60 tekens)
2. SEO Beschrijving (max 160 tekens) 
3. Alt Tekst (max 125 tekens)

Formaat als JSON: {"seoTitle": "...", "seoDescription": "...", "altText": "..."}

BELANGRIJK: 
- Alles moet in het Nederlands zijn
- De tekst moet aantrekkelijk zijn voor kleurplaten website
- Zorg voor relevante zoekwoorden
- Beschrijving moet duidelijk en boeiend zijn`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  try {
    return JSON.parse(content);
  } catch {
    return {
      seoTitle: title.substring(0, 60),
      seoDescription: idea.substring(0, 160),
      altText: title.substring(0, 125),
    };
  }
}
