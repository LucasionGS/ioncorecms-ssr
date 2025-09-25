import React from 'react';

interface QuoteBlockProps {
  data?: {
    quote?: string;
    author?: string;
    source?: string;
    style?: 'default' | 'pullquote' | 'blockquote';
  };
}

function QuoteBlock({ data }: QuoteBlockProps) {
  const { 
    quote = '', 
    author = '', 
    source = '', 
    style = 'default' 
  } = data || {};

  return (
    <div className={`quote-block quote-block--${style}`}>
      <blockquote className="quote-block__quote">
        "{quote}"
      </blockquote>
      {(author || source) && (
        <footer className="quote-block__footer">
          {author && <cite className="quote-block__author">{author}</cite>}
          {source && <span className="quote-block__source"> - {source}</span>}
        </footer>
      )}
    </div>
  );
}

export default QuoteBlock;