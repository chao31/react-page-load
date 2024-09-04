import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';

import DownRefresh from './DownRefresh';

const Row = ({
  listConDomRef,
  isListenPullDownEvent,
  canScroll,
  isFirstRender,
  estimatedItemSize,
  start,
  index,
  item,
  updatePostionAndOffset,
  children,
}) => {
  const rowRef = useRef(null);
  // 是否是下拉刷新 Dom
  const isDownDom = index === 0 && isListenPullDownEvent;

  useEffect(() => {
    const shoulScrollUpToHidePullDom =
      isFirstRender.current && index === 1 && isListenPullDownEvent;

    // 上拉加载时，动态渲染出顶部 dom 后，若其高度跟estimatedItemSize不一致，会导致下面dom往下排列，需通过滚动调整使页面不动
    adjustTopScrollHeight();
    updatePostionAndOffset();

    // 判断是否隐藏下拉刷新，第一次渲染且第一个dom加载完毕，会往上滚动，不展示下拉刷新
    shoulScrollUpToHidePullDom && hidePullDom();
  }, []);

  const adjustTopScrollHeight = () => {
    const height = rowRef.current.getBoundingClientRect().height;
    const dValue = height - estimatedItemSize;

    if (dValue !== 0 && index < start) {
      canScroll.current = false;

      listConDomRef.current.scrollTop =
        listConDomRef.current.scrollTop + dValue;

      canScroll.current = true;
    }
  };

  const hidePullDom = () => {
    isFirstRender.current = false;
    rowRef.current.scrollIntoView();
  };

  if (isDownDom)
    return <DownRefresh key={index} refs={rowRef} dataId={index} />;

  return (
    <div
      ref={rowRef}
      className="infinite-list-item"
      key={index}
      data-id={index}
    >
      {typeof children === 'function' ? children({ item, index }) : children}
    </div>
  );
};

export default Row;
