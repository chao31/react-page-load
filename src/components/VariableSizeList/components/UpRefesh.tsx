import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Loading from '../../Loading';

const UpRefesh = ({
  refs,
  dataId,
  bottomLoadMoreCallback,
  hasMoreBottomData,
  loader,
}) => {
  useLayoutEffect(() => {
    if (!hasMoreBottomData) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          bottomLoadMoreCallback();
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
  }, [hasMoreBottomData]);

  return (
    <div
      ref={refs}
      className="infinite-list-item infinite-pull-down-refesh"
      data-id={dataId}
      style={{ display: hasMoreBottomData ? 'block' : 'none' }}
    >
      {loader ? loader : <Loading />}
    </div>
  );
};

export default UpRefesh;
