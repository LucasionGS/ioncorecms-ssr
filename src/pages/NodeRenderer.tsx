import React, { Suspense } from 'react'
import NodeTypeRegistry from '../registries/NodeTypeRegistry.ts'
import { useParams } from 'react-router-dom';

export default function NodeRenderer(props: {
  serverNodeData?: any;
  serverNodeType?: string;
}) {
  const { serverNodeData, serverNodeType } = props;
  const params = useParams();
  
  const [nodeData, setNodeData] = React.useState<any>(serverNodeData ?? null);
  const [nodeType, setNodeType] = React.useState<string | null>(serverNodeType ?? null);
  const [loading, setLoading] = React.useState(serverNodeData && serverNodeType ? false : true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const path = params['*'] || 'home';
    setLoading(true);
    setError(null);
    
    fetch(`/api/nodes/resolve/${path}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNodeData(data.data.node);
          setNodeType(data.data.nodeType);
        } else {
          setError('Content not found');
        }
      })
      .catch(err => {
        console.error('Error fetching node data:', err);
        setError('Failed to load content');
      })
      .finally(() => setLoading(false));
  }, [params]);
  
  // Handle loading state
  if (loading) {
    return (
      <div>
        <div style={{ backgroundColor: '#eeeeee0f', height: '3em', width: '50%', marginBottom: '20px' }}></div>
        <div style={{ backgroundColor: '#eeeeee0f', height: '1em', width: '100%', marginBottom: '0.5em' }}></div>
        <div style={{ backgroundColor: '#eeeeee0f', height: '1em', width: '100%', marginBottom: '0.5em' }}></div>
        <div style={{ backgroundColor: '#eeeeee0f', height: '1em', width: '80%', marginBottom: '0.5em' }}></div>
        <div style={{ backgroundColor: '#eeeeee0f', height: '1em', width: '100%', marginBottom: '0.5em' }}></div>
        <div style={{ backgroundColor: '#eeeeee0f', height: '1em', width: '100%', marginBottom: '0.5em' }}></div>
        <div style={{ backgroundColor: '#eeeeee0f', height: '1em', width: '80%', marginBottom: '0.5em' }}></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
        <h2>Content Not Found</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Handle successful content loading
  if (nodeType && nodeData) {
    const NodeComponent = NodeTypeRegistry.getComponent(nodeType);
    if (NodeComponent) {
      return (
        <div>
          <Suspense fallback={<div>Loading content...</div>}>
            <NodeComponent {...nodeData} />
          </Suspense>
        </div>
      );
    }
  }

  // Fallback if no content found
  return (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
      <h2>Content Not Available</h2>
      <p>The requested content could not be displayed.</p>
    </div>
  );
}
