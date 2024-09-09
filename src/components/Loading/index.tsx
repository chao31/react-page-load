import React from 'react';
import './index.css';

const Loading = ({ hasMore }) => {
  return (
    hasMore && (
      <div className="infinite-loading">
        <div className="infinite-loading-dot"></div>
        <div className="infinite-loading-dot"></div>
        <div className="infinite-loading-dot"></div>
        <div className="infinite-loading-dot"></div>
        <div className="infinite-loading-dot"></div>
      </div>
    )
  );
};

export default Loading;
