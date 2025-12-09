import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEOEditor from './SEOEditor';

export default function ReviewGallery({ promptId }: { promptId: string }) {
  const [prompt, setPrompt] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchPrompt();
  }, [promptId]);

  // Poll for updates when not editing
  useEffect(() => {
    // Only poll if not currently editing - stop polling during SEO editing
    if (!editingPage) {
      const interval = setInterval(fetchPrompt, 2000);
      return () => clearInterval(interval);
    }
  }, [editingPage]);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;
    // If it's a relative path, make it absolute to the backend
    return `http://localhost:5000${path}`;
  };

  const fetchPrompt = async () => {
    try {
      const response = await axios.get(`/api/ai/prompt/${promptId}`);
      setPrompt(response.data.prompt);
      setPages(response.data.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setLoading(false);
    }
  };

  const approvePage = async (page: any, seoData: any) => {
    try {
      const response = await axios.post('/api/ai/approve-page', {
        pageId: page.id,
        title: seoData.title || page.idea,
        seoTitle: seoData.seoTitle,
        seoDescription: seoData.seoDescription,
        altText: seoData.altText,
        category: seoData.category || prompt.category,
      });
      
      // Update the page in the pages array with approval data
      const updatedPages = pages.map(p => {
        if (p.id === page.id) {
          return {
            ...p,
            approved_id: response.data.approvedId,
            approved_title: seoData.title || page.idea,
            seo_title: seoData.seoTitle,
            seo_description: seoData.seoDescription,
            alt_text: seoData.altText,
            slug: (seoData.title || page.idea).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          };
        }
        return p;
      });
      
      setPages(updatedPages);
      setEditingPage(null);
    } catch (error) {
      alert('Error approving page: ' + error);
    }
  };

  const rejectPage = async (pageId: string, feedback: string) => {
    try {
      await axios.post('/api/ai/reject-page', {
        pageId,
        feedback,
      });
      fetchPrompt();
    } catch (error) {
      alert('Error rejecting page: ' + error);
    }
  };

  if (loading) {
    return <div className="form-card"><p>⏳ Pagina's laden...</p></div>;
  }

  if (!prompt) {
    return <div className="form-card"><p>❌ Prompt niet gevonden</p></div>;
  }

  const generatedPages = pages.filter(p => p.status === 'pending_review');
  const approvedPages = pages.filter(p => p.approved_id && p.approved_title);
  const rejectedPages = pages.filter(p => p.status === 'rejected');

  const publishPage = async (approvedPage: any) => {
    try {
      const confirmed = window.confirm(`Publiceren: ${approvedPage.approved_title}?`);
      if (!confirmed) return;

      await axios.post('/api/wordpress/publish-page', {
        approvedPageId: approvedPage.approved_id,
      });
      alert('✅ Geplaatst op WordPress!');
      fetchPrompt();
    } catch (error: any) {
      alert('❌ Publiceren mislukt: ' + (error.response?.data?.error || error.message));
    }
  };

  const downloadImage = (imageUrl: string, imageName: string) => {
    const fullUrl = getImageUrl(imageUrl);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${imageName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="form-card">
      <h2>👁️ Kleurplaten Controleren</h2>
      <p className="subtitle">
        Gegenereerd: {generatedPages.length} | Goedgekeurd: {approvedPages.length} | Afgewezen: {rejectedPages.length}
      </p>

      {editingPage && (
        <SEOEditor
          page={editingPage}
          category={prompt.category}
          onApprove={(seoData) => approvePage(editingPage, seoData)}
          onCancel={() => setEditingPage(null)}
        />
      )}

      {!editingPage && (
        <div className="pages-grid">
          {generatedPages.map((page) => (
            <div key={page.id} className="page-card">
              <div className="page-preview-container">
                {page.image_url ? (
                  <img src={getImageUrl(page.image_url)} alt={page.idea} className="page-preview" />
                ) : (
                  <div className="image-loading">
                    <div className="spinner"></div>
                    <p>Generating image...</p>
                  </div>
                )}
              </div>
              <p className="page-idea">{page.idea}</p>
              <div className="page-actions">
                <button
                  onClick={() => setEditingPage(page)}
                  className="btn-approve"
                  disabled={!page.image_url}
                >
                  ✅ Goedkeuren
                </button>
                <button
                  onClick={() => {
                    const feedback = prompt('Reden voor afwijzing:');
                    if (feedback) rejectPage(page.id, feedback);
                  }}
                  className="btn-reject"
                >
                  ❌ Afwijzen
                </button>
                <button
                  onClick={() => downloadImage(page.image_url, page.idea.substring(0, 30))}
                  className="btn-download"
                  disabled={!page.image_url}
                  title="Download deze kleurplaat"
                >
                  📥 Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {approvedPages.length > 0 && (
        <div className="approved-section">
          <h3>✅ Goedgekeurde Pagina's ({approvedPages.length})</h3>
          <div className="approved-list">
            {approvedPages.map((page) => (
              <div key={page.approved_id} className="approved-item">
                <span>{page.approved_title}</span>
                <button 
                  onClick={() => publishPage(page)}
                  className="btn-publish"
                >
                  📤 Upload naar WordPress
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
