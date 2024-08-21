import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import faker from 'faker';
import './index.css';
//所有列表数据
const listData = new Array(1000).fill(true).map((item, index) => ({
  id: index,
  value: faker.lorem.sentences(), // 长文本,
}));

// 预估的列表项高度
const estimatedItemSize = 40;

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
  // const listHeight = listData.length * itemSize;
  const listHeight = positions[positions.length - 1].bottom;
  // 可显示的列表项数
  // const visibleCount = Math.ceil(screenHeight / itemSize);
  const visibleCount = Math.ceil(screenHeight / estimatedItemSize);
  // 此时的结束索引
  const end = start + visibleCount;
  //获取真实显示列表数据
  const visibleData = listData.slice(start, Math.min(end, listData.length));
  // 偏移量对应的style
  const getTransform = `translate3d(0, ${startOffset}px, 0)`;

  useEffect(() => {
    console.log('start: ', start);

    updateItemsSize();
    updateStartOffset();
  }, [start]);

  // useLayoutEffect(() => {
  //   alert(1);
  // }, [start]);

  const updateItemsSize = () => {
    let nodes = document.querySelectorAll('.infinite-list-item');
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
          const _positions = [...positions];
          _positions[index].bottom = _positions[index].bottom - dValue;
          _positions[index].height = height;
          for (let k = index + 1; k < _positions.length; k++) {
            _positions[k].top = _positions[k - 1].bottom;
            _positions[k].bottom = _positions[k].bottom - dValue;
          }
          setPositions(_positions);
        }
      });
  };

  //获取列表起始索引
  const getStartIndex = (scrollTop = 0) => {
    //二分法查找
    return binarySearch(positions, scrollTop);
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

  const scrollEvent = () => {
    //当前滚动位置
    let scrollTop = listDomRef.current.scrollTop;
    //此时的开始索引
    // setStart(Math.floor(scrollTop / itemSize));
    setStart(getStartIndex(scrollTop));

    //此时的偏移量
    // setStartOffset(scrollTop - (scrollTop % itemSize));
    updateStartOffset();
  };

  const updateStartOffset = () => {
    let startOffset = start >= 1 ? positions[start - 1].bottom : 0;
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
      <div className="infinite-list" style={{ transform: getTransform }}>
        {visibleData.map(item => {
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
        })}
      </div>
    </div>
  );
};

export default Index;
