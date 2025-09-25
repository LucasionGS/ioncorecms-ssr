import React from 'react';

interface ArticleProps {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  authorId?: number;
  author?: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Article({ title, excerpt, content, author, createdAt }: ArticleProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      color: '#ffffff',
      lineHeight: '1.6'
    }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #444', paddingBottom: '1rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '0.5rem',
          color: '#ffffff',
          fontWeight: '700'
        }}>
          {title}
        </h1>
        
        {excerpt && (
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#cccccc',
            fontStyle: 'italic',
            margin: '1rem 0'
          }}>
            {excerpt}
          </p>
        )}
        
        <time style={{ 
          color: '#999999',
          fontSize: '0.9rem'
        }}>
          Published on {formatDate(createdAt)} {author ? `by ${author.username}` : ''}
        </time>
      </header>
      
      <div style={{ 
        fontSize: '1.1rem',
        color: '#ffffff'
      }}>
        {/* Simple Markdown-like rendering */}
        {content.split('\n').map((paragraph, index) => {
          if (paragraph.trim() === '') return null;
          
          if (paragraph.startsWith('# ')) {
            return <h2 key={index} style={{ fontSize: '1.8rem', margin: '2rem 0 1rem 0', color: '#ffffff' }}>{paragraph.slice(2)}</h2>;
          }
          if (paragraph.startsWith('## ')) {
            return <h3 key={index} style={{ fontSize: '1.5rem', margin: '1.5rem 0 0.5rem 0', color: '#ffffff' }}>{paragraph.slice(3)}</h3>;
          }
          
          return (
            <p key={index} style={{ 
              marginBottom: '1rem',
              color: '#ffffff'
            }}>
              {paragraph}
            </p>
          );
        })}
      </div>
    </article>
  );
}