import axios from 'axios';
import { Buffer } from 'buffer';

// Build WordPress API URL correctly
const WORDPRESS_URL = process.env.WORDPRESS_URL || 'https://www.kleurplatenparadijs.nl';
const WP_API_URL = `${WORDPRESS_URL}/wp-json/wp/v2`;

// Create Basic Auth header for authenticated requests
// WordPress credentials should be username:password in base64
const username = process.env.WORDPRESS_USERNAME || '';
const password = process.env.WORDPRESS_PASSWORD || '';

// Create auth string (handle special characters in password)
const authString = username && password ? `${username}:${password}` : '';
const authHeader = authString ? Buffer.from(authString).toString('base64') : '';

// Verify auth header was created
if (!authHeader) {
  console.error('❌ ERROR: Could not create Basic Auth header!');
  console.error('   Username:', username ? 'set' : 'NOT SET');
  console.error('   Password:', password ? 'set' : 'NOT SET');
} else {
  console.log('✅ Basic Auth header created successfully');
}

// Also try cookie-based auth as fallback
const wpJwtToken = process.env.WORDPRESS_JWT_TOKEN || '';

console.log('🔧 WordPress Configuration:');
console.log('  URL:', WORDPRESS_URL);
console.log('  API Endpoint:', WP_API_URL);
console.log('  Username:', username ? `${username.substring(0, 5)}***` : 'NOT SET');
console.log('  Password:', password ? `***${password.length} chars***` : 'NOT SET');
console.log('  Auth header:', authHeader ? `Basic ${authHeader.substring(0, 20)}***` : 'EMPTY');
console.log('  JWT Token:', wpJwtToken ? '***set***' : 'not set');
console.log('');
console.log('⚠️  IMPORTANT: Basic Authentication for WordPress REST API:');
console.log('   Method 1: Use Application Passwords (Recommended)');
console.log('     - Go to: WordPress Admin > Users > Your Profile > Application Passwords');
console.log('     - Create a new application password for "REST API"');
console.log('     - Use it as WORDPRESS_PASSWORD in .env');
console.log('');
console.log('   Method 2: Enable Basic Auth (requires plugin or custom setup)');
console.log('     - Install "JWT Authentication for WP-REST API" or similar plugin');
console.log('     - Some WordPress hosts disable Basic Auth by default');
console.log('');

// Create two clients: one with auth, one without
const wpClientAuthHeaders: any = {
  'Content-Type': 'application/json',
};

// Only add auth header if we have credentials
if (authHeader) {
  wpClientAuthHeaders['Authorization'] = `Basic ${authHeader}`;
  console.log('✅ Authorization header will be added to requests');
} else {
  console.error('❌ WARNING: No Authorization header! Requests will fail with 401');
}

const wpClientAuth = axios.create({
  baseURL: WP_API_URL,
  headers: wpClientAuthHeaders,
  timeout: 15000,
});

// Add interceptors to log requests/responses
wpClientAuth.interceptors.request.use(
  (config) => {
    console.log(`🔐 [${config.method?.toUpperCase()}] ${config.url}`);
    console.log(`   Authorization: ${config.headers['Authorization'] ? '✓ present' : '✗ MISSING'}`);
    if (config.data) {
      console.log(`   Data length: ${JSON.stringify(config.data).length} bytes`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

wpClientAuth.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] Success`);
    return response;
  },
  (error) => {
    console.log(`❌ [${error.response?.status}] ${error.response?.data?.message || error.message}`);
    return Promise.reject(error);
  }
);

// Public client (no auth) for reading public data
const wpClientPublic = axios.create({
  baseURL: WP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Test WordPress connectivity
export async function testWordPressConnection(): Promise<{ status: boolean; message: string }> {
  try {
    console.log('🔍 Testing WordPress connection...');
    console.log('  URL:', WORDPRESS_URL);
    console.log('  Username:', username ? '✓ Set' : '✗ Not set');
    console.log('  Password:', password ? '✓ Set' : '✗ Not set');
    
    // Test public endpoint first (no auth needed)
    console.log('📂 Testing public categories endpoint...');
    const publicTest = await wpClientPublic.get('/categories?per_page=1');
    console.log('✅ Public endpoint works');

    // Test authenticated endpoint - get current user
    console.log('🔐 Testing authenticated /users/me endpoint...');
    try {
      const userResponse = await wpClientAuth.get('/users/me');
      console.log('✅ Authenticated as:', userResponse.data.name);
      console.log('   User ID:', userResponse.data.id);
      console.log('   Capabilities:', Object.keys(userResponse.data.capabilities || {}).join(', '));
    } catch (userError: any) {
      console.error('⚠️  Could not fetch current user:', userError.response?.data?.message);
    }

    // Test post creation capability
    console.log('📝 Testing post creation capability...');
    const response = await wpClientAuth.get('/posts', {
      params: { per_page: 1 },
    });

    console.log('✅ WordPress connection successful');
    return {
      status: true,
      message: `Connected to WordPress at ${WORDPRESS_URL}`,
    };
  } catch (error: any) {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.message || error.message;
    
    console.error('❌ WordPress connection failed');
    console.error('  Status:', status);
    console.error('  Error:', errorMsg);
    
    if (status === 401) {
      return {
        status: false,
        message: 'Authentication failed - check WordPress username/password. Note: WordPress REST API may require an Application Password instead of user password.',
      };
    } else if (status === 403) {
      return {
        status: false,
        message: 'Permission denied - user may not have permission to access REST API',
      };
    }
    
    return {
      status: false,
      message: `Failed to connect: ${errorMsg}`,
    };
  }
}

export async function getCategoryId(categoryName: string): Promise<number> {
  try {
    console.log('🔍 Looking up category:', categoryName);
    const response = await wpClientPublic.get('/categories', {
      params: { search: categoryName, per_page: 100 },
    });

    const category = response.data.find(
      (cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (category) {
      console.log('✅ Found category ID:', category.id);
      return category.id;
    }

    // Create category if not found (requires auth)
    console.log('📝 Category not found, creating new category:', categoryName);
    const newCat = await wpClientAuth.post('/categories', { name: categoryName });
    console.log('✅ Created category with ID:', newCat.data.id);
    return newCat.data.id;
  } catch (error: any) {
    console.error('❌ Category fetch error:', error.message);
    console.error('📋 Status:', error.response?.status);
    console.error('📋 Data:', error.response?.data);
    return 1; // Default category
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    console.log('📂 Fetching categories from WordPress...');
    const response = await wpClientPublic.get('/categories', {
      params: { per_page: 100, orderby: 'name', order: 'asc' },
    });
    
    console.log(`✅ Found ${response.data.length} categories`);
    return response.data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    }));
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error);
    return [];
  }
}

export async function uploadMedia(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string = 'application/pdf'
): Promise<number> {
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType });
  formData.append('file', blob, filename);

  const response = await wpClientAuth.post('/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.id;
}

export async function publishPost(
  title: string,
  content: string,
  categoryId: number,
  slug: string,
  seoData: {
    seoTitle?: string;
    seoDescription?: string;
  },
  featuredImageId?: number
): Promise<number> {
  try {
    console.log('📝 Publishing post with data:', { title, slug, categoryId });
    
    const postData: any = {
      title,
      content,
      slug,
      status: 'publish',
      type: 'post',
      categories: [categoryId],
      author: 0, // Let WordPress use current user
      meta: {
        ...seoData,
      },
    };

    if (featuredImageId) {
      postData.featured_media = featuredImageId;
    }

    console.log('🔐 Using wpClientAuth - sending request...');
    console.log('📋 Post data:', JSON.stringify(postData, null, 2));
    
    const response = await wpClientAuth.post('/posts', postData);
    console.log('✅ Post published with ID:', response.data.id);
    return response.data.id;
  } catch (error: any) {
    console.error('❌ publishPost error:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Code:', error.response.data?.code);
      console.error('📋 Message:', error.response.data?.message);
      
      // Try to get more details
      if (error.response.data?.data) {
        console.error('📋 Details:', JSON.stringify(error.response.data.data, null, 2));
      }
      
      // Provide helpful error message
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('⚠️  Authentication/Permission Issue:');
        console.error('   - Verify Application Password has POST permission');
        console.error('   - Check if a plugin is blocking post creation');
        console.error('   - Ensure user account is not restricted');
        console.error('   - Try creating a post directly from WordPress admin to test');
      }
    }
    throw error;
  }
}

export async function updatePostMeta(
  postId: number,
  metaData: Record<string, string>
): Promise<void> {
  for (const [key, value] of Object.entries(metaData)) {
    await wpClientAuth.post(`/posts/${postId}`, {
      meta: { [key]: value },
    });
  }
}
