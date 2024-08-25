import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import './index.css';

declare global {
  interface Window {
    ResizeObserver: any;
    setScreenHeight: any;
  }
}

//二分法查找
const binarySearch = (list, value) => {
  let start = 0;
  let end = list.length - 1;
  let tempIndex = null;
  while (start <= end) {
    let midIndex = parseInt(((start + end) / 2).toString());
    let midValue = list[midIndex].bottom;
    if (midValue === value) {
      return midIndex + 1;
    } else if (midValue < value) {
      start = midIndex + 1;
    } else if (midValue > value) {
      if (tempIndex === null || tempIndex > midIndex) {
        tempIndex = midIndex;
      }
      end = end - 1;
    }
  }
  return tempIndex;
};

const Index = props => {
  const {
    // 列表数据
    listData = [],
    // 预估的列表项高度
    estimatedItemSize = 40,
    // 缓冲区的比例
    bufferScale = 1,
    children,
  } = props;
  const [screenHeight, setScreenHeight] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const [start, setStart] = useState(0);

  // 根据预估item高度，初始化一份list高度数组
  const initPositions = () =>
    listData.map((item, index) => ({
      index,
      height: estimatedItemSize,
      top: index * estimatedItemSize,
      bottom: (index + 1) * estimatedItemSize,
    }));

  const [positions, setPositions] = useState(initPositions);
  const listConDomRef = useRef(null);
  const listVisibleDomRef = useRef(null);

  // 列表总高度
  const listHeight = positions[positions.length - 1].bottom;
  // 可显示的列表项数
  const visibleCount = Math.ceil(screenHeight / estimatedItemSize);
  // 此时的结束索引
  const end = start + visibleCount;

  // 缓冲区item个数，可能是小数，所以需要取整
  const bufferCount = Math.floor(bufferScale * visibleCount);
  // 上方缓冲区
  const aboveCount = Math.min(start, bufferCount);
  // 下方缓冲区
  const belowCount = Math.min(listData.length - end, bufferCount);

  //获取真实显示列表数据
  const visibleData = listData.slice(start - aboveCount, end + belowCount);

  const updateItemsPosition = () => {
    let nodes = listVisibleDomRef.current.children;
    const _positions = [...positions];
    nodes &&
      nodes.length > 0 &&
      Array.from(nodes).forEach((node: HTMLElement) => {
        let rect = node.getBoundingClientRect();
        let height = rect.height;
        let index = +node.dataset.id;
        let oldHeight = positions[index].height;
        let dValue = oldHeight - height;
        //存在差值
        if (dValue) {
          _positions[index].bottom = _positions[index].bottom - dValue;
          _positions[index].height = height;
          for (let k = index + 1; k < _positions.length; k++) {
            _positions[k].top = _positions[k - 1].bottom;
            _positions[k].bottom = _positions[k].bottom - dValue;
          }
        }
      });
    setPositions(_positions);
  };

  //获取列表起始索引
  const getStartIndex = (scrollTop = 0) => {
    //二分法查找
    const _start = binarySearch(positions, scrollTop);
    return _start;
  };

  useEffect(() => {
    // 监听container的高度变化，比如缩放窗口时，容器高度会变化
    observerHeightResize();
  }, []);

  useLayoutEffect(() => {
    updatePostionAndOffset();
  }, [start]);

  const updatePostionAndOffset = () => {
    updateItemsPosition();
    updateStartOffset();
  };

  const updateStartIndex = () => {
    //当前滚动位置
    let scrollTop = listConDomRef.current.scrollTop;
    //此时的开始索引
    const newStart = getStartIndex(scrollTop);
    setStart(newStart);
    // 拉到列表最底部时，resize窗口时，需要快速更新视图
    updateStartOffset(newStart);
  };

  const updateStartOffset = (newStart = start) => {
    let startOffset;

    if (newStart >= 1) {
      let size =
        positions[newStart].top - positions[newStart - aboveCount]?.top || 0;
      startOffset = positions[newStart - 1].bottom - size;
    } else {
      startOffset = 0;
    }
    setStartOffset(startOffset);
  };

  const observerHeightResize = () => {
    if (!('ResizeObserver' in window)) {
      // init container 的 height
      setScreenHeight(listConDomRef.current.clientHeight);
      console.warn('浏览器不支持ResizeObserver，请pollyfill！');
      return;
    }

    // 创建一个 ResizeObserver 实例，并传入回调函数
    const resizeObserver = new window.ResizeObserver(entries => {
      // contentBoxSize 属性较新，担心有兼容性问题，所以这里用 entries[0].contentRect
      setScreenHeight(entries[0].contentRect.height);
      updateStartIndex();
    });
    // 开始观察 container 的高度变化
    resizeObserver.observe(listConDomRef.current);
  };

  return (
    <div
      ref={listConDomRef}
      className="infinite-list-container"
      onScroll={updateStartIndex}
    >
      <div
        className="infinite-list-phantom"
        style={{ height: listHeight + 'px' }}
      ></div>
      <div
        ref={listVisibleDomRef}
        className="infinite-list"
        style={{ transform: `translate3d(0, ${startOffset}px, 0)` }}
      >
        {visibleData.map((item, index) => {
          // 拿到在ListData中真实的index
          const key = positions[index + start - aboveCount].index;
          return (
            <Row
              key={key}
              index={key}
              item={item}
              updatePostionAndOffset={updatePostionAndOffset}
              children={children}
            />
          );
        })}
      </div>
    </div>
  );
};

const Row = ({ index, item, updatePostionAndOffset, children }) => {
  useEffect(() => {
    updatePostionAndOffset();
  }, []);

  return (
    <div className="infinite-list-item" key={index} data-id={index}>
      {typeof children === 'function' ? children({ item, index }) : children}
    </div>
  );
};

export default Index;
