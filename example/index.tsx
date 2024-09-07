import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FixedSizeList, VariableSizeList } from '../.';
import * as faker from 'faker';

import './index.css';

// const FixedSizeListExample = () => {
//   const rowHeight = React.useCallback(index => 25 + index * 2, []);
//   return (
//     <FixedSizeList
//       height={150}
//       itemCount={1000}
//       itemSize={rowHeight}
//       width={300}
//     >
//       {({ index, style }) => <div style={style}>Row {index}</div>}
//     </FixedSizeList>
//   );
// };

declare global {
  interface Window {
    dd: any;
  }
}
let pageTop = 1;
let pageBottom = 1;

const VariableSizeListExample = () => {
  const [hasMoreTopData, setHasMoreTopData] = React.useState(true);
  const [hasMoreBottomData, setHasMoreBottomData] = React.useState(true);

  //所有列表数据
  const listData = new Array(100)
    .fill(true)
    .map((_, index) => `第${index + 1}个: ${faker.lorem.sentences()}`);

  // 模拟一个2秒后返回数据的请求
  const requestTopData = async () => {
    console.log('请求了top数据');
    // 设置一个2秒的延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (pageTop > 2) {
      setHasMoreTopData(false);
      return [];
    }

    pageTop += 1;

    // 返回模拟数据
    return new Array(100)
      .fill(true)
      .map((_, index) => `第${index}个: ${faker.lorem.sentences()}`);
  };

  // 模拟一个2秒后返回数据的请求
  const requestBottomData = async () => {
    console.log('请求了bottom数据');
    // if (pageBottom > 1) {
    //   setHasMoreBottomData(false);
    //   return [];
    // }
    // pageBottom += 1;

    // 设置一个2秒的延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    // await new Promise(resolve => {
    //   window.dd = resolve;
    // });

    if (pageBottom > 1) {
      setHasMoreBottomData(false);
      return [];
    }
    pageBottom += 1;

    // 返回模拟数据
    return new Array(100)
      .fill(true)
      .map((_, index) => `第${index + 1}个: ${faker.lorem.sentences()}`);
  };

  const Row = ({ item, index }) => {
    return (
      <div className="my-list-item" key={index}>
        <span>{item}</span>
        {/* {index == 1 && <img src={`https://picsum.photos/200/300`} />} */}
      </div>
    );
  };

  return (
    <div className="my-list">
      <VariableSizeList
        listData={listData}
        estimatedItemSize={90}
        bufferScale={1}
        pullDownCallback={requestTopData}
        pullUpCallback={requestBottomData}
        hasMoreTopData={hasMoreTopData}
        hasMoreBottomData={hasMoreBottomData}
        // loader={<div>加载中...</div>}
      >
        {Row}
      </VariableSizeList>
    </div>
  );
};

ReactDOM.render(<VariableSizeListExample />, document.getElementById('root'));
