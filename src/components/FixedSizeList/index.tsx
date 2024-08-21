import React, { useEffect, useState, useRef } from 'react';
import './index.css';

//所有列表数据
const listData = new Array(100).fill(true).map((item, index) => ({
  id: index,
  value: index,
}));

// 每项高度
const itemSize = 200;

const Index = () => {
  const [screenHeight, setScreenHeight] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const [start, setStart] = useState(0);
  const listDomRef = useRef(null);

  // 列表总高度
  const listHeight = listData.length * itemSize;
  // 可显示的列表项数
  const visibleCount = Math.ceil(screenHeight / itemSize);
  // 此时的结束索引
  const end = start + visibleCount;
  //获取真实显示列表数据
  const visibleData = listData.slice(start, Math.min(end, listData.length));
  // 偏移量对应的style
  const getTransform = `translate3d(0, ${startOffset}px, 0)`;

  useEffect(() => {
    setScreenHeight(listDomRef.current.clientHeight);
  }, []);

  const scrollEvent = () => {
    //当前滚动位置
    let scrollTop = listDomRef.current.scrollTop;
    //此时的开始索引
    setStart(Math.floor(scrollTop / itemSize));
    //此时的偏移量
    setStartOffset(scrollTop - (scrollTop % itemSize));
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
              style={{ height: itemSize + 'px', lineHeight: itemSize + 'px' }}
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
