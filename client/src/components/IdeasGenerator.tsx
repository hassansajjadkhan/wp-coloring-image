import React, { useState } from 'react';
import axios from 'axios';

export default function IdeasGenerator({
  promptData,
  onIdeasGenerated,
  onStartGeneration,
  ideas,
}: {
  promptData: any;
  onIdeasGenerated: (ideas: string[]) => void;
  onStartGeneration: () => void;
  ideas: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>(ideas);

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/generate-ideas', {
        quantity: promptData.quantity,
        style: promptData.style,
        existingIdeas: selectedIdeas,
      });
      onIdeasGenerated(response.data.ideas);
      setSelectedIdeas(response.data.ideas);
    } catch (error) {
      alert('Error generating ideas: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIdea = (idea: string) => {
    setSelectedIdeas(prev =>
      prev.includes(idea)
        ? prev.filter(i => i !== idea)
        : [...prev, idea]
    );
  };

  React.useEffect(() => {
    if (ideas.length === 0) {
      generateIdeas();
    }
  }, []);

  return (
    <div className="form-card">
      <h2>💡 Controleer & Selecteer Ideeën</h2>
      <p className="subtitle">
        AI heeft {selectedIdeas.length} ideeën gegenereerd voor "{promptData.title}"
      </p>

      <div className="ideas-list">
        {selectedIdeas.map((idea, idx) => (
          <div key={idx} className="idea-item">
            <input
              type="checkbox"
              checked={true}
              onChange={() => toggleIdea(idea)}
              id={`idea-${idx}`}
            />
            <label htmlFor={`idea-${idx}`}>{idea}</label>
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          onClick={generateIdeas}
          disabled={loading}
          className="btn-secondary"
        >
          🔄 Opnieuw Genereren
        </button>
        <button
          onClick={onStartGeneration}
          className="btn-primary"
        >
          🎨 Genereer {selectedIdeas.length} Kleurplaten
        </button>
      </div>

      {loading && <p className="loading">⏳ Ideeën genereren...</p>}
    </div>
  );
}
