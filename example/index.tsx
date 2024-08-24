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
const VariableSizeListExample = () => {
  //所有列表数据
  const listData = new Array(100).fill(true).map((item, index) => ({
    id: index,
    value: index + '_' + faker.lorem.sentences(), // 长文本,
  }));

  return (
    <div className="my-list">
      <VariableSizeList
        listData={listData}
        estimatedItemSize={40}
        bufferScale={1}
      />
    </div>
  );
};

ReactDOM.render(<VariableSizeListExample />, document.getElementById('root'));
