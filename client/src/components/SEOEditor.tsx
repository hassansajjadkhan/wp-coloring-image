import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SEOEditor({
  page,
  category,
  onApprove,
  onCancel,
}: {
  page: any;
  category: string;
  onApprove: (data: any) => void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState({
    title: '',
    seoTitle: '',
    seoDescription: '',
    altText: '',
    category,
  });

  useEffect(() => {
    generateSEO();
  }, []);

  const generateSEO = async () => {
    try {
      const response = await axios.post('/api/ai/generate-seo', {
        title: page.idea,
        idea: page.idea,
      });
      setSeoData(prev => ({
        ...prev,
        title: page.idea,
        seoTitle: response.data.seoTitle,
        seoDescription: response.data.seoDescription,
        altText: response.data.altText,
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error generating SEO:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="seo-editor">⏳ SEO-inhoud genereren...</div>;
  }

  return (
    <div className="seo-editor">
      <h3>✏️ SEO & Metadata Bewerken</h3>

      <div className="form-group">
        <label>Paginatitel (max 30 tekens)</label>
        <input
          type="text"
          name="title"
          value={seoData.title}
          onChange={handleChange}
          maxLength={30}
        />
        <span className="char-count">{seoData.title.length}/30</span>
      </div>

      <div className="form-group">
        <label>SEO-titel (max 60 tekens)</label>
        <input
          type="text"
          name="seoTitle"
          value={seoData.seoTitle}
          onChange={handleChange}
          maxLength={60}
        />
        <span className="char-count">{seoData.seoTitle.length}/60</span>
      </div>

      <div className="form-group">
        <label>SEO-beschrijving (max 160 tekens)</label>
        <textarea
          name="seoDescription"
          value={seoData.seoDescription}
          onChange={handleChange}
          maxLength={160}
          rows={3}
        />
        <span className="char-count">{seoData.seoDescription.length}/160</span>
      </div>

      <div className="form-group">
        <label>Afbeelding Alt-tekst (max 125 tekens)</label>
        <input
          type="text"
          name="altText"
          value={seoData.altText}
          onChange={handleChange}
          maxLength={125}
        />
        <span className="char-count">{seoData.altText.length}/125</span>
      </div>

      <div className="form-group">
        <label>Categorie</label>
        <input
          type="text"
          name="category"
          value={seoData.category}
          onChange={handleChange}
        />
      </div>

      <div className="seo-actions">
        <button onClick={() => onApprove(seoData)} className="btn-primary">
          ✅ Goedkeuren & Opslaan
        </button>
        <button onClick={onCancel} className="btn-secondary">
          ❌ Annuleren
        </button>
      </div>
    </div>
  );
}
