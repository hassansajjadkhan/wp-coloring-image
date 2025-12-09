import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PromptForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    quantity: '10',
    style: 'cute',
    category: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📂 Fetching WordPress categories...');
      const response = await axios.get('http://localhost:5000/api/wordpress/categories');
      const cats = response.data.categories || [];
      console.log(`✅ Fetched ${cats.length} categories:`, cats.map((c: any) => c.name));
      
      setCategories(cats);
      // Set first category as default
      if (cats && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0].id.toString() }));
      }
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Failed to fetch categories:', error);
      setError('Kan categorieën niet laden. Probeer het opnieuw.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.quantity && formData.style && formData.category) {
      onSubmit(formData);
    }
  };

  return (
    <div className="form-card">
      <h2>📝 Maak uw kleurplaat thema</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kleurplaat Thema</label>
          <input
            type="text"
            name="title"
            placeholder="bijv. Kerstland, Oceanische Vrienden"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Aantal Pagina's</label>
          <input
            type="number"
            name="quantity"
            min="1"
            max="50"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Stijl</label>
          <select name="style" value={formData.style} onChange={handleChange}>
            <option value="cute">Schattig & Speels</option>
            <option value="detailed">Gedetailleerd & Ingewikkeld</option>
            <option value="simple">Eenvoudig & Schoon</option>
            <option value="fantasy">Fantasy & Magisch</option>
            <option value="nature">Natuur & Botanisch</option>
          </select>
        </div>

        <div className="form-group">
          <label>Categorie</label>
          {error && (
            <div className="error-message" style={{ color: '#f44336', marginBottom: '10px', fontSize: '0.9em' }}>
              ⚠️ {error}
            </div>
          )}
          {loading ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select disabled style={{ flex: 1 }}><option>Categorieën laden...</option></select>
              <button 
                type="button"
                onClick={fetchCategories}
                className="btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
              >
                🔄 Probeer opnieuw
              </button>
            </div>
          ) : categories.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                style={{ flex: 1 }}
              >
                <option value="">-- Selecteer Categorie --</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button 
                type="button"
                onClick={fetchCategories}
                className="btn-secondary"
                title="Categorieën verversen"
                style={{ whiteSpace: 'nowrap', padding: '10px 15px' }}
              >
                🔄
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                name="category"
                placeholder="bijv. Dieren, Kerstmis, Bloemen"
                value={formData.category}
                onChange={handleChange}
                required
                style={{ flex: 1 }}
              />
              <button 
                type="button"
                onClick={fetchCategories}
                className="btn-secondary"
                title="Categorieën verversen"
                style={{ whiteSpace: 'nowrap' }}
              >
                🔄 Verversen
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Laden...' : 'Genereer Ideeën ✨'}
        </button>
      </form>
    </div>
  );
}
