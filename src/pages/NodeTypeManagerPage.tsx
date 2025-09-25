import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { NodeBuilder } from '../components/NodeBuilder/index.ts';
import type { NodeTypeInfo } from '../components/NodeBuilder/types.ts';
import adminApi from '../services/adminApi.ts';
import './NodeTypeManagerPage.scss';

interface Node {
  id: number;
  [key: string]: any;
}

interface NodesResponse {
  nodes: Node[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const NodeTypeManagerPage: React.FC = () => {
  const { nodeType, nodeId } = useParams<{ nodeType: string; nodeId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current action from URL path
  const action = location.pathname.includes('/create') ? 'create' : 
                location.pathname.includes('/edit') ? 'edit' : null;

  const [nodeTypeInfo, setNodeTypeInfo] = useState<NodeTypeInfo | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  // Determine mode from URL
  const isCreateMode = location.pathname.endsWith('/create');
  const isEditMode = location.pathname.includes('/edit/');
  const showBuilder = isCreateMode || isEditMode;
  const editingNodeId = isEditMode && nodeId ? parseInt(nodeId) : undefined;

  useEffect(() => {
    if (nodeType) {
      loadNodeTypeInfo();
      // Only load nodes list when not in builder mode
      if (!action) {
        loadNodes();
      }
    }
  }, [nodeType, searchParams, action]);

  useEffect(() => {
    if (action) return; // Don't load nodes when in builder mode
    
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    
    if (page !== pagination.page || search !== searchTerm) {
      setSearchTerm(search);
      loadNodes();
    }
  }, [searchParams, action]);

  const loadNodeTypeInfo = async () => {
    if (!nodeType) return;

    try {
      const response = await adminApi.getNodeTypeFields(nodeType);
      
      if (response.success) {
        setNodeTypeInfo(response.data);
      } else {
        setError('Failed to load node type information');
      }
    } catch (err) {
      setError('Failed to load node type information');
      console.error('Error loading node type info:', err);
    }
  };

  const loadNodes = async () => {
    if (!nodeType) return;

    try {
      setLoading(true);
      const page = parseInt(searchParams.get('page') || '1');
      const search = searchParams.get('search') || '';
      
      const response = await adminApi.getNodes(nodeType, {
        page,
        limit: 20,
        search
      });
      
      if (response.success) {
        const data: NodesResponse = response.data;
        setNodes(data.nodes);
        setPagination(data.pagination);
      } else {
        setError('Failed to load nodes');
      }
    } catch (err) {
      setError('Failed to load nodes');
      console.error('Error loading nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleCreateNode = () => {
    navigate(`/admin/node-builder/${nodeType}/create`);
  };

  const handleEditNode = (node: Node) => {
    navigate(`/admin/node-builder/${nodeType}/edit/${node.id}`);
  };

  const handleDeleteNode = async (nodeId: number) => {
    if (!nodeType) return;
    
    if (!confirm('Are you sure you want to delete this node?')) {
      return;
    }

    try {
      const response = await adminApi.deleteNode(nodeType, nodeId);
      
      if (response.success) {
        await loadNodes(); // Refresh the list
      } else {
        alert('Failed to delete node');
      }
    } catch (err) {
      alert('Failed to delete node');
      console.error('Error deleting node:', err);
    }
  };

  const handleSaveNode = async (nodeData: Record<string, any>) => {
    if (!nodeType) return;

    try {
      let response;
      if (editingNodeId) {
        response = await adminApi.updateNode(nodeType, editingNodeId, nodeData);
      } else {
        response = await adminApi.createNode(nodeType, nodeData);
      }
      
      if (response.success) {
        // navigate(`/admin/node-builder/${nodeType}`);
        // Go to the new/updated node's edit page
        const newNode = await adminApi.getNodeUrl(nodeType, response.data.id);
        navigate(newNode.data.url);
        // await loadNodes(); // Refresh the list
      } else {
        alert('Failed to save node');
      }
    } catch (err) {
      alert('Failed to save node');
      console.error('Error saving node:', err);
    }
  };

  const handleCancelBuilder = () => {
    navigate(`/admin/node-builder/${nodeType}`);
  };

  const formatNodeDisplay = (node: Node) => {
    // Try to find a good display value
    if (node.title) return node.title;
    if (node.name) return node.name;
    if (node.slug) return node.slug;
    return `Node ${node.id}`;
  };

  if (!nodeType) {
    return (
      <div className="node-type-manager-page--error">
        <div className="error">No node type specified</div>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <div className="node-type-manager-page">
        <NodeBuilder
          nodeType={nodeType}
          nodeId={editingNodeId}
          nodeTypeInfo={nodeTypeInfo || undefined}
          onSave={handleSaveNode}
          onCancel={handleCancelBuilder}
        />
      </div>
    );
  }

  const displayName = nodeTypeInfo?.settings?.displayName || nodeType;

  return (
    <div className="node-type-manager-page">
      <div className="node-type-manager-page__header">
        <div className="node-type-manager-page__title-section">
          <button
            className="node-type-manager-page__back"
            onClick={() => navigate('/admin/node-builder')}
          >
            ← Back to Node Types
          </button>
          <h1 className="node-type-manager-page__title">
            {displayName} Management
          </h1>
          {nodeTypeInfo?.settings?.description && (
            <p className="node-type-manager-page__description">
              {nodeTypeInfo.settings.description}
            </p>
          )}
        </div>
        
        <button
          className="node-type-manager-page__create"
          onClick={handleCreateNode}
        >
          Create New {displayName}
        </button>
      </div>

      <div className="node-type-manager-page__controls">
        <form className="node-type-manager-page__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={`Search ${displayName.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="node-type-manager-page__search-input"
          />
          <button type="submit" className="node-type-manager-page__search-button">
            Search
          </button>
        </form>
      </div>

      <div className="node-type-manager-page__content">
        {loading ? (
          <div className="node-type-manager-page__loading">Loading...</div>
        ) : error ? (
          <div className="node-type-manager-page__error">
            <div className="error">Error: {error}</div>
            <button onClick={loadNodes} className="retry-button">Retry</button>
          </div>
        ) : nodes.length === 0 ? (
          <div className="node-type-manager-page__empty">
            <h3>No {displayName} Found</h3>
            <p>
              {searchTerm 
                ? `No ${displayName.toLowerCase()} match your search criteria.`
                : `No ${displayName.toLowerCase()} have been created yet.`
              }
            </p>
            <button
              className="node-type-manager-page__create-empty"
              onClick={handleCreateNode}
            >
              Create First {displayName}
            </button>
          </div>
        ) : (
          <>
            <div className="node-type-manager-page__list">
              {nodes.map((node) => (
                <div key={node.id} className="node-item">
                  <div className="node-item__content">
                    <h3 className="node-item__title">
                      {formatNodeDisplay(node)}
                    </h3>
                    <div className="node-item__meta">
                      ID: {node.id}
                      {node.createdAt && (
                        <> • Created: {new Date(node.createdAt).toLocaleDateString()}</>
                      )}
                      {node.updatedAt && node.updatedAt !== node.createdAt && (
                        <> • Updated: {new Date(node.updatedAt).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  
                  <div className="node-item__actions">
                    <button
                      className="node-item__action node-item__action--edit"
                      onClick={() => handleEditNode(node)}
                    >
                      Edit
                    </button>
                    <button
                      className="node-item__action node-item__action--delete"
                      onClick={() => handleDeleteNode(node.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="node-type-manager-page__pagination">
                <button
                  className="pagination__button"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                
                <span className="pagination__info">
                  Page {pagination.page} of {pagination.totalPages} 
                  ({pagination.total} total)
                </span>
                
                <button
                  className="pagination__button"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NodeTypeManagerPage;