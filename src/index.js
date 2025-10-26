import React from 'react';
import ReactDOM from 'react-dom/client';
import TemplatePicker from '../components/TemplatePicker';
import '../components/TemplatePicker.css';

// Mock functions for demonstration
const handleTemplateSelect = (template) => {
  console.log('Template selected:', template);
  alert(`Template "${template.templateName}" selected for cloning!`);
};

const handlePaperMode = (template) => {
  console.log('Paper mode for template:', template);
  alert(`Starting paper trading with "${template.templateName}" strategy!`);
};

const handleEditInStudio = (template) => {
  console.log('Edit in studio:', template);
  alert(`Opening "${template.templateName}" in FormulaStudio for editing!`);
};

const App = () => {
  return (
    <div className="app">
      <div className="app-header">
        <h1>🚀 Trading Strategy Templates</h1>
        <p>Select a strategy template to clone, test in paper mode, or edit in FormulaStudio</p>
      </div>
      
      <TemplatePicker
        onTemplateSelect={handleTemplateSelect}
        onPaperMode={handlePaperMode}
        onEditInStudio={handleEditInStudio}
      />
    </div>
  );
};

// Add some basic app styles
const appStyles = `
  .app {
    min-height: 100vh;
    background-color: #f8fafc;
  }
  
  .app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .app-header h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
  }
  
  .app-header p {
    font-size: 1.2rem;
    margin: 0;
    opacity: 0.9;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = appStyles;
document.head.appendChild(styleSheet);

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);