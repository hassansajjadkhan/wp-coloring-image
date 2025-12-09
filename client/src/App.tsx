import React, { useState } from 'react';
import axios from 'axios';
import PromptForm from './components/PromptForm';
import IdeasGenerator from './components/IdeasGenerator';
import ReviewGallery from './components/ReviewGallery';
import SchedulerSettings from './components/SchedulerSettings';
import './App.css';

export default function App() {
  const [currentStep, setCurrentStep] = useState('prompt'); // prompt, ideas, review, scheduler
  const [promptData, setPromptData] = useState<any>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [promptId, setPromptId] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  const handlePromptSubmit = (data: any) => {
    setPromptData(data);
    setCurrentStep('ideas');
  };

  const handleIdeasGenerated = (generatedIdeas: string[]) => {
    setIdeas(generatedIdeas);
  };

  const handleStartGeneration = async () => {
    try {
      const response = await axios.post('/api/ai/create-prompt', {
        ...promptData,
        ideas,
      });
      setPromptId(response.data.promptId);
      setCurrentStep('review');
    } catch (error) {
      alert('Error creating prompt: ' + error);
    }
  };

  const testWordPressConnection = async () => {
    setDiagnosticLoading(true);
    try {
      const response = await axios.get('/api/wordpress/test-connection');
      setDiagnosticResult({ type: 'connection', data: response.data });
    } catch (error: any) {
      setDiagnosticResult({ type: 'connection', error: error.response?.data || error.message });
    }
    setDiagnosticLoading(false);
  };

  const testPostCreation = async () => {
    setDiagnosticLoading(true);
    try {
      const response = await axios.post('/api/wordpress/test-create-post', {});
      setDiagnosticResult({ type: 'post-creation', data: response.data });
    } catch (error: any) {
      setDiagnosticResult({ type: 'post-creation', error: error.response?.data || error.message });
    }
    setDiagnosticLoading(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 AI Kleurplaten Generator</h1>
        <p>Genereer, Controleer & Publiceer Kleurplaten op WordPress</p>
        <button 
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🔧 Diagnostics
        </button>
      </header>

      {showDiagnostics && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          margin: '10px',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3>🔧 WordPress Diagnostics</h3>
          <div style={{ marginBottom: '10px' }}>
            <button onClick={testWordPressConnection} disabled={diagnosticLoading}>
              Test WordPress Connection
            </button>
            <button onClick={testPostCreation} disabled={diagnosticLoading} style={{ marginLeft: '10px' }}>
              Test Post Creation
            </button>
          </div>
          
          {diagnosticLoading && <p>Loading...</p>}
          
          {diagnosticResult && (
            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              <strong>{diagnosticResult.type}</strong>
              <pre>{JSON.stringify(diagnosticResult.data || diagnosticResult.error, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <nav className="steps-nav">
        <button
          className={`step ${currentStep === 'prompt' ? 'active' : ''}`}
          onClick={() => setCurrentStep('prompt')}
        >
          1. Thema
        </button>
        <button
          className={`step ${currentStep === 'ideas' ? 'active' : ''}`}
          onClick={() => setCurrentStep('ideas')}
          disabled={!promptData}
        >
          2. Ideeën
        </button>
        <button
          className={`step ${currentStep === 'review' ? 'active' : ''}`}
          onClick={() => setCurrentStep('review')}
          disabled={!promptId}
        >
          3. Controleren
        </button>
        <button
          className={`step ${currentStep === 'scheduler' ? 'active' : ''}`}
          onClick={() => setCurrentStep('scheduler')}
        >
          4. Planner
        </button>
      </nav>

      <main className="app-content">
        {currentStep === 'prompt' && (
          <PromptForm onSubmit={handlePromptSubmit} />
        )}

        {currentStep === 'ideas' && (
          <IdeasGenerator
            promptData={promptData}
            onIdeasGenerated={handleIdeasGenerated}
            onStartGeneration={handleStartGeneration}
            ideas={ideas}
          />
        )}

        {currentStep === 'review' && promptId && (
          <ReviewGallery promptId={promptId} />
        )}

        {currentStep === 'scheduler' && (
          <SchedulerSettings />
        )}
      </main>
    </div>
  );
}
