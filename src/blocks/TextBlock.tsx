import React from 'react';

interface TextBlockProps {
  data?: {
    content?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

function TextBlock({ data }: TextBlockProps) {
  const { content = '', alignment = 'left' } = data || {};

  return (
    <div className={`text-block text-block--${alignment}`}>
      <div className="text-block__content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export default TextBlock;