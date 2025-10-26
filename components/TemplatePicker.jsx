import React, { useState, useEffect } from 'react';
import './TemplatePicker.css';

const TemplatePicker = ({ onTemplateSelect, onPaperMode, onEditInStudio }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterAsset, setFilterAsset] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setLoading(false);
    }
  };

  const handleClone = async (template) => {
    try {
      const response = await fetch('/api/templates/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: template.id }),
      });
      
      if (response.ok) {
        const clonedTemplate = await response.json();
        onTemplateSelect(clonedTemplate);
      }
    } catch (error) {
      console.error('Error cloning template:', error);
    }
  };

  const handlePaperMode = (template) => {
    onPaperMode(template);
  };

  const handleEditInStudio = (template) => {
    onEditInStudio(template);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || template.riskLevel === filterRisk;
    const matchesAsset = filterAsset === 'all' || template.assetType === filterAsset;
    
    return matchesSearch && matchesRisk && matchesAsset;
  });

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Very Low': return '#10b981';
      case 'Low': return '#34d399';
      case 'Medium': return '#f59e0b';
      case 'High': return '#f97316';
      case 'Very High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAssetIcon = (assetType) => {
    switch (assetType) {
      case 'Stocks': return '📈';
      case 'Options': return '📊';
      case 'ETFs': return '📋';
      case 'Forex': return '💱';
      case 'Crypto': return '₿';
      default: return '💰';
    }
  };

  if (loading) {
    return (
      <div className="template-picker-loading">
        <div className="loading-spinner"></div>
        <p>Loading strategy templates...</p>
      </div>
    );
  }

  return (
    <div className="template-picker">
      <div className="template-picker-header">
        <h2>Strategy Templates</h2>
        <p>Choose from proven trading strategies or create your own</p>
        
        <div className="template-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filters">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Risk Levels</option>
              <option value="Very Low">Very Low</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </select>
            
            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Asset Types</option>
              <option value="Stocks">Stocks</option>
              <option value="Options">Options</option>
              <option value="ETFs">ETFs</option>
              <option value="Forex">Forex</option>
              <option value="Crypto">Crypto</option>
            </select>
          </div>
          
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className={`templates-container ${viewMode}`}>
        {filteredTemplates.map((template) => (
          <div key={template.templateName} className="template-card">
            <div className="template-header">
              <div className="template-title">
                <span className="asset-icon">{getAssetIcon(template.assetType)}</span>
                <h3>{template.templateName}</h3>
              </div>
              <div className="template-meta">
                <span 
                  className="risk-badge"
                  style={{ backgroundColor: getRiskColor(template.riskLevel) }}
                >
                  {template.riskLevel}
                </span>
                <span className="win-rate">{Math.round(template.winRate * 100)}% Win Rate</span>
              </div>
            </div>
            
            <div className="template-content">
              <p className="template-description">{template.description}</p>
              
              <div className="template-details">
                <div className="detail-item">
                  <span className="detail-label">Asset Type:</span>
                  <span className="detail-value">{template.assetType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Recommended Universe:</span>
                  <span className="detail-value">
                    {Array.isArray(template.recommendedUniverse) 
                      ? template.recommendedUniverse.slice(0, 3).join(', ') + 
                        (template.recommendedUniverse.length > 3 ? '...' : '')
                      : template.recommendedUniverse}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="template-actions">
              <button
                className="action-btn primary"
                onClick={() => handleClone(template)}
              >
                Clone Strategy
              </button>
              <button
                className="action-btn secondary"
                onClick={() => handlePaperMode(template)}
              >
                Try in Paper Mode
              </button>
              <button
                className="action-btn tertiary"
                onClick={() => handleEditInStudio(template)}
              >
                Edit in FormulaStudio
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="no-templates">
          <p>No templates match your current filters.</p>
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setFilterRisk('all');
              setFilterAsset('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplatePicker;