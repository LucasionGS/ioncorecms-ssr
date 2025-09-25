import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NodeTypeInfo } from '../components/NodeBuilder/types.ts';
import adminApi from '../services/adminApi.ts';
import './NodeBuilderPage.scss';

const NodeBuilderPage: React.FC = () => {
  const [nodeTypes, setNodeTypes] = useState<NodeTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadNodeTypes();
  }, []);

  const loadNodeTypes = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/node-builder/types');
      
      if (response.data.success) {
        setNodeTypes(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to load node types');
      console.error('Error loading node types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeTypeClick = (nodeType: string) => {
    navigate(`/admin/node-builder/${nodeType}`);
  };

  if (loading) {
    return (
      <div className="node-builder-page node-builder-page--loading">
        <div className="node-builder-page__loading">Loading node types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="node-builder-page node-builder-page--error">
        <div className="node-builder-page__error">Error: {error}</div>
        <button 
          className="node-builder-page__retry"
          onClick={loadNodeTypes}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="node-builder-page">
      <div className="node-builder-page__header">
        <h1 className="node-builder-page__title">Node Builder</h1>
        <p className="node-builder-page__description">
          Create and manage content nodes using the registered node types.
        </p>
      </div>

      <div className="node-builder-page__content">
        {nodeTypes.length === 0 ? (
          <div className="node-builder-page__empty">
            <h3>No Node Types Registered</h3>
            <p>No node types have been registered yet. Contact your developer to register some node types.</p>
          </div>
        ) : (
          <div className="node-builder-page__types">
            {nodeTypes.map((nodeType) => (
              <div 
                key={nodeType.type} 
                className="node-type-card"
                onClick={() => handleNodeTypeClick(nodeType.type)}
              >
                <div className="node-type-card__icon">
                  {nodeType.settings?.icon ? (
                    // <img src={nodeType.settings.icon} alt="" className="node-type-card__icon-img" />
                    nodeType.settings.icon
                  ) : (
                    <div className="node-type-card__icon-placeholder">
                      {(nodeType.settings?.displayName || nodeType.type).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="node-type-card__content">
                  <h3 className="node-type-card__title">
                    {nodeType.settings?.displayName || nodeType.type}
                  </h3>
                  {nodeType.settings?.description && (
                    <p className="node-type-card__description">
                      {nodeType.settings.description}
                    </p>
                  )}
                  <div className="node-type-card__meta">
                    {nodeType.fields.length} field{nodeType.fields.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="node-type-card__arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeBuilderPage;