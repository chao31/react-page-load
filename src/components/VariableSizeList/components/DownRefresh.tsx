import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';

const PullRefresh = ({
  refs,
  dataId,
  topLoadMoreCallback,
  hasMoreTopData,
  start,
}) => {
  useLayoutEffect(() => {
    if (!hasMoreTopData) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          topLoadMoreCallback();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    );

    observer.observe(refs.current);

    return () => {
      // clean函数之前之前，ref 已经没有了，所以上面要用 useLayoutEffect
      observer.unobserve(refs.current);
    };
  }, [hasMoreTopData]);

  return (
    <div
      ref={refs}
      className="infinite-list-item infinite-list-pull-refesh"
      data-id={dataId}
      style={{ display: hasMoreTopData ? 'block' : 'none' }}
    >
      下拉刷新
    </div>
  );
};

export default PullRefresh;
