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
let page = 1;

const VariableSizeListExample = () => {
  const [hasMoreTopData, setHasMoreTopData] = React.useState(true);
  //所有列表数据
  const listData = new Array(100)
    .fill(true)
    .map((_, index) => `第${index}个: ${faker.lorem.sentences()}`);

  // 模拟一个2秒后返回数据的请求
  const fetchTopData = async () => {
    console.log('请求了top数据');
    if (page > 20) {
      setHasMoreTopData(false);
      return [];
    }

    page += 1;
    // 设置一个2秒的延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 返回模拟数据
    return new Array(100)
      .fill(true)
      .map((_, index) => `第${index}个: ${faker.lorem.sentences()}`);
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
        pullDownCallback={fetchTopData}
        hasMoreTopData={hasMoreTopData}
      >
        {Row}
      </VariableSizeList>
    </div>
  );
};

ReactDOM.render(<VariableSizeListExample />, document.getElementById('root'));
