import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import './index.css';

declare global {
  interface Window {
    ResizeObserver: any;
    setScreenHeight: any;
  }
}

const Index = props => {
  const {
    // 列表数据
    listData = [],
    // 预估的列表项高度
    estimatedItemSize = 40,
    // 缓冲区的比例
    bufferScale = 1,
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

  // 列表总高度
  const listHeight = positions[positions.length - 1].bottom;
  // 可显示的列表项数
  const visibleCount = Math.ceil(screenHeight / estimatedItemSize);
  // 此时的结束索引
  const end = start + visibleCount;

  // 上方缓冲区
  const aboveCount = Math.min(start, bufferScale * visibleCount);
  // 下方缓冲区
  const belowCount = Math.min(
    listData.length - end,
    bufferScale * visibleCount
  );

  //获取真实显示列表数据
  const visibleData = listData.slice(start - aboveCount, end + belowCount);

  const updateItemsSize = () => {
    let nodes = document.querySelectorAll('.infinite-list-item');
    const _positions = [...positions];
    nodes &&
      nodes.length > 0 &&
      nodes.forEach((node: HTMLElement) => {
        let rect = node.getBoundingClientRect();
        let height = rect.height;
        let index = +node?.dataset?.id;
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

  useEffect(() => {
    // 监听container的高度变化，比如缩放窗口时，容器高度会变化
    observerHeightResize();
  }, []);

  useLayoutEffect(() => {
    updateItemsSize();
    updateStartOffset();
  }, [start]);

  const reRenderList = () => {
    //当前滚动位置
    let scrollTop = listConDomRef.current.scrollTop;
    //此时的开始索引
    // setStart(Math.floor(scrollTop / itemSize));
    const _start = getStartIndex(scrollTop);
    setStart(_start);

    //此时的偏移量
    // setStartOffset(scrollTop - (scrollTop % itemSize));
    updateStartOffset(_start);
  };

  const updateStartOffset = (_start = start) => {
    // if (!_start) return;
    // let startOffset = start >= 1 ? positions[start - 1].bottom : 0;
    let startOffset;

    if (_start >= 1) {
      let size =
        positions[_start].top -
        (positions[_start - aboveCount]
          ? positions[_start - aboveCount].top
          : 0);
      startOffset = positions[_start - 1].bottom - size;
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
      reRenderList();
    });
    // 开始观察 container 的高度变化
    resizeObserver.observe(listConDomRef.current);
  };

  return (
    <div
      ref={listConDomRef}
      className="infinite-list-container"
      onScroll={reRenderList}
    >
      <div
        className="infinite-list-phantom"
        style={{ height: listHeight + 'px' }}
      ></div>
      <div
        className="infinite-list"
        style={{ transform: `translate3d(0, ${startOffset}px, 0)` }}
      >
        {visibleData.map(item => {
          return (
            <Row
              key={item.id}
              item={item}
              updateItemsSize={updateItemsSize}
              updateStartOffset={updateStartOffset}
            />
          );
        })}
      </div>
    </div>
  );
};

const Row = ({ item, updateItemsSize, updateStartOffset }) => {
  useEffect(() => {
    updateItemsSize();
    updateStartOffset();
  }, []);

  return (
    <div
      className="infinite-list-item"
      key={item.id}
      data-id={item.id}
      // style={{ height: itemSize + 'px', lineHeight: itemSize + 'px' }}
    >
      {item.value}
    </div>
  );
};

export default Index;
