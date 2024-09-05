import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Row } from './components/';

import './index.css';

declare global {
  interface Window {
    ResizeObserver: any;
    setScreenHeight: any;
    positions: any;
    setStart: any;
    setStartOffset: any;
    vlistData: any;
    aa: any;
    setVlistData: any;
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
    loadMoreTop,
    hasMoreTop = true,
  } = props;
  const [screenHeight, setScreenHeight] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const [start, setStart] = useState(0);
  const [isAtTop, setIsAtTop] = useState(false);
  const [vlistData, setVlistData] = useState(listData);
  const [isListenPullDownEvent, setIsListenPullDownEvent] = useState(
    hasMoreTop
  );
  window.setStartOffset = setStartOffset;
  window.setVlistData = setVlistData;
  window.vlistData = vlistData;
  window.setStart = setStart;

  // 根据预估item高度，初始化一份list高度数组
  const initPositions = () =>
    vlistData.map((item, index) => ({
      index,
      height: estimatedItemSize,
      top: index * estimatedItemSize,
      bottom: (index + 1) * estimatedItemSize,
    }));

  const [positions, setPositions] = useState(initPositions);
  window.positions = positions;
  const canFetch = useRef(true);
  const listConDomRef = useRef(null);
  const listVisibleDomRef = useRef(null);
  const pauseScrollListening = useRef(false);
  const isFirstRender = useRef(true);

  // 列表总高度
  const listHeight = positions[positions.length - 1].bottom;
  // 可显示的列表项数
  const visibleCount = Math.ceil(screenHeight / estimatedItemSize);
  // 此时的结束索引
  const end = start + visibleCount;

  // 缓冲区item个数，可能是小数，所以需要取整
  const bufferCount = Math.floor(bufferScale * visibleCount);
  // 上方缓冲区的item个数
  const aboveCount = Math.min(start, bufferCount);
  // 下方缓冲区的item个数
  const belowCount = Math.min(vlistData.length - end, bufferCount);
  //获取真实显示列表数据
  const visibleData = vlistData.slice(start - aboveCount, end + belowCount);

  // 如果某个 Item 的高度变化，需要当前 Item 的 bottom，以及后面 Item 的 top 和 bottom
  const updatePositions = () => {
    let nodes = listVisibleDomRef.current.children;
    if (nodes && nodes.length > 0) {
      const _positions = [...positions];
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
    }
  };

  const updateStartOffset = (newStart = start) => {
    let startOffset;

    if (newStart >= 1) {
      let size =
        positions[newStart].top - positions[newStart - aboveCount]?.top || 0;
      startOffset = positions[newStart - 1].bottom - size;
      // startOffset = positions[newStart - aboveCount]?.top || 0;
    } else {
      startOffset = 0;
    }
    setStartOffset(startOffset);

    // const newAboveCount = Math.min(newStart, bufferCount);
    // const startOffset = positions[newStart - newAboveCount].top;
    // setStartOffset(startOffset);
  };

  //获取列表起始索引
  const getStartIndex = (scrollTop = 0) => {
    //二分法查找
    const _start = binarySearch(positions, scrollTop);
    return _start;
  };

  useEffect(() => {
    // 监听container的高度变化，比如缩放窗口时，容器高度会变化
    observerContainerHeightResize();
  }, []);

  useLayoutEffect(() => {
    updatePostionAndOffset();
  }, [start]);

  const updatePostionAndOffset = () => {
    updatePositions();
    updateStartOffset();
  };

  useEffect(() => {
    console.log('isAtTop: ', isAtTop);

    if (isAtTop && loadMoreTop) {
      fetchTopData();
    }
  }, [isAtTop]);

  useEffect(() => {
    setPositions(initPositions());
  }, [vlistData]);

  useEffect(() => {
    setIsListenPullDownEvent(hasMoreTop);
    const newList = hasMoreTop
      ? [vlistData[0], ...vlistData]
      : [...vlistData.slice(1)];
    setVlistData(newList);
  }, [hasMoreTop]);

  const fetchTopData = async () => {
    if (!canFetch.current) return;

    canFetch.current = false;
    const newList = await loadMoreTop();
    canFetch.current = true;

    if (!isListenPullDownEvent) {
      // setVlistData(vlistData.slice(1));
      return;
    }

    const rectOld = document.querySelector(
      `.infinite-list-item[data-id="${start}"]`
    );

    if (!rectOld) return;
    const bottomOld = rectOld.getBoundingClientRect().bottom;

    const [topLoadDom, ...list] = vlistData;
    setVlistData([topLoadDom, ...newList, ...list]);
    const newStart = newList.length + start;
    setStart(newStart);
    const rectNew = document.querySelector(
      `.infinite-list-item[data-id="${newStart}"]`
    );
    rectNew?.scrollIntoView();
    const bottomNew = rectNew.getBoundingClientRect().bottom;
    const dValue = bottomNew - bottomOld;
    document.querySelector('.infinite-list-container').scrollTop =
      document.querySelector('.infinite-list-container').scrollTop + dValue;
  };

  const updateStartIndex = () => {
    if (pauseScrollListening.current) return;

    if (!listConDomRef.current) return;
    //当前滚动位置
    let scrollTop = listConDomRef.current.scrollTop;
    //此时的开始索引
    const newStart = getStartIndex(scrollTop);
    if (newStart === null) return;

    setStart(newStart);
    // 拉到列表最底部时，resize窗口时，需要快速更新视图
    updateStartOffset(newStart);

    const isTop = scrollTop <= 0 || scrollTop <= 1; // 可以根据需要调整阈值

    setIsAtTop(isTop);
    console.log('isTop', isTop);
  };

  const observerContainerHeightResize = () => {
    if (!('ResizeObserver' in window)) {
      setScreenHeight(listConDomRef.current.clientHeight);
      console.error('浏览器不支持ResizeObserver，请pollyfill！');
      return;
    }

    // 创建一个 ResizeObserver 实例，并传入回调函数
    const resizeObserver = new window.ResizeObserver(entries => {
      // console.log('111entries: ', entries);

      const entry = entries[0];
      // contentBoxSize 属性较新，担心有兼容性问题，contentRect 较老但未来可能被抛弃
      const newHeight = entry.contentBoxSize
        ? entry.contentBoxSize[0].blockSize
        : entry.contentRect.height;
      setScreenHeight(newHeight);
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
              listConDomRef={listConDomRef}
              isListenPullDownEvent={isListenPullDownEvent}
              pauseScrollListening={pauseScrollListening}
              isFirstRender={isFirstRender}
              oldHeight={positions[key].height}
              start={start}
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

const UpRefesh = () => {
  return <div className="infinite-list-down-refesh">上拉加载</div>;
};

export default Index;
