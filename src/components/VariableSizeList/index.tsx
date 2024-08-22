import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import faker from 'faker';
import './index.css';
//所有列表数据
const listData = new Array(10000).fill(true).map((item, index) => ({
  id: index,
  value: index + '_' + faker.lorem.sentences(), // 长文本,
}));

// 预估的列表项高度
const estimatedItemSize = 40;

const bufferScale = 1;

const Index = () => {
  const [screenHeight, setScreenHeight] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const [start, setStart] = useState(0);

  const initPositions = () => {
    return listData.map((item, index) => {
      return {
        index,
        height: estimatedItemSize,
        top: index * estimatedItemSize,
        bottom: (index + 1) * estimatedItemSize,
      };
    });
  };

  const [positions, setPositions] = useState(initPositions);
  const listDomRef = useRef(null);

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
    setScreenHeight(listDomRef.current.clientHeight);
  }, []);

  useLayoutEffect(() => {
    updateItemsSize();
    updateStartOffset();
  }, [start]);

  const scrollEvent = () => {
    //当前滚动位置
    let scrollTop = listDomRef.current.scrollTop;
    //此时的开始索引
    // setStart(Math.floor(scrollTop / itemSize));
    const _start = getStartIndex(scrollTop);
    console.log('_start: ', _start);
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

  return (
    <div
      ref={listDomRef}
      className="infinite-list-container"
      onScroll={scrollEvent}
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
