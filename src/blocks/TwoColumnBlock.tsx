import React from 'react';
import { BlockListRenderer } from '../components/BlockRenderer.tsx';

interface TwoColumnBlockProps {
  data?: {
    leftContent?: any[]; // Array of block instances
    rightContent?: any[]; // Array of block instances
    columnRatio?: '50-50' | '60-40' | '40-60' | '70-30' | '30-70';
  };
}

function TwoColumnBlock({ data }: TwoColumnBlockProps) {
  const { 
    leftContent = [], 
    rightContent = [], 
    columnRatio = '50-50' 
  } = data || {};

  return (
    <div className={`two-column-block two-column-block--${columnRatio}`}>
      <div className="two-column-block__column two-column-block__left">
        <BlockListRenderer blocks={leftContent} />
      </div>
      <div className="two-column-block__column two-column-block__right">
        <BlockListRenderer blocks={rightContent} />
      </div>
    </div>
  );
}

export default TwoColumnBlock;