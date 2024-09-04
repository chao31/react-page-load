import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';

// let isInit = true;
const PullRefresh = ({ refs, dataId }) => {
  // useEffect(() => {
  //   if (!isInit) return;

  //   isInit = false;
  //   const height = refs.current.getBoundingClientRect().height;
  //   window.setStart(1);
  //   document.querySelector('.infinite-list-container').scrollTop = height;
  // }, []);

  return (
    <div
      ref={refs}
      className="infinite-list-item infinite-list-pull-refesh"
      data-id={dataId}
    >
      下拉刷新
    </div>
  );
};

export default PullRefresh;
