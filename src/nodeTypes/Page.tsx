import React from 'react';
import { Link } from 'react-router-dom';
import { BlockListRenderer } from '../components/BlockRenderer.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import './Page.scss';

interface PageProps {
  id: number;
  slug?: string;
  title: string;
  content: string | any[]; // Can be string (legacy) or blocks array
  authorId?: number;
  createdAt: string;
  updatedAt: string;
}

export default function Page(props: PageProps) {
  const { authState } = useAuth();
  
  // Parse content if it's a string (for backward compatibility)
  let blocks: any[] = [];
  
  if (typeof props.content === 'string') {
    try {
      blocks = JSON.parse(props.content);
    } catch (error) {
      // If parsing fails, treat as legacy HTML content
      console.warn('Failed to parse page content as blocks, falling back to HTML:', error);
      return (
        <div className="page">
          <div className="page__header">
            <h1 className="page__title">{props.title}</h1>
          </div>
          <div className="page__content">
            <div dangerouslySetInnerHTML={{ __html: props.content }} />
          </div>
        </div>
      );
    }
  } else if (Array.isArray(props.content)) {
    blocks = props.content;
  }

  return (
    <div className="page">
      {authState.isAuthenticated && (
        <div className="page__actions">
          <Link to={`/admin/node-builder/page/edit/${props.id}`}>
            <button className="page__edit-button">
              Edit
            </button>
          </Link>
        </div>
      )}
      <div className="page__header">
        <h1 className="page__title">{props.title}</h1>
      </div>
      <div className="page__content">
        <BlockListRenderer blocks={blocks} />
      </div>
    </div>
  );
}
