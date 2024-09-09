import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import VariableSizeList, {
  ExposeListData,
} from '../src/components/VariableSizeList';
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
  const [inputValue, setInputValue] = React.useState(20);
  const [hasMoreTopData, setHasMoreTopData] = React.useState(true);
  const [hasMoreBottomData, setHasMoreBottomData] = React.useState(true);
  const ref = React.useRef(null);

  //所有列表数据
  const listData = new Array(50)
    .fill(true)
    .map((_, index) => `第0页第${index + 1}个: ${faker.lorem.sentences()}`);

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
    return new Array(20)
      .fill(true)
      .map(
        (_, index) =>
          `第${-1 * (pageTop - 1)}页${index + 1}个: ${faker.lorem.sentences()}`
      );
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    // await new Promise(resolve => {
    //   window.dd = resolve;
    // });

    if (pageBottom > 2) {
      setHasMoreBottomData(false);
      return [];
    }
    pageBottom += 1;

    // 返回模拟数据
    return new Array(20)
      .fill(true)
      .map(
        (_, index) =>
          `第${pageBottom - 1}页第${index + 1}个: ${faker.lorem.sentences()}`
      );
  };

  const Row = ({ item, index }) => {
    const click = () => {
      if (confirm(`您确定要删除${index}吗？`)) {
        if (!ref.current) return;
        ref?.current?.delItem(index);
      }
      console.log('index: ', index, item);
    };

    return (
      <div className="my-list-item" key={index} onClick={click}>
        <span>{item}</span>
        {/* {index == 1 && <img src={`https://picsum.photos/200/300`} />} */}
      </div>
    );
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!ref.current) return;
    ref.current.delItem(inputValue);

    // const list = [...ref.current.getListData()];
    // list.splice(inputValue, 1);
    // ref.current.setListData(list);
    // ref.current.setListData([...list.slice(0, 1)]);
    // ref.current.setListData([...list.slice(0, 19), ...list.slice(30)]);
  };

  return (
    <div className="wrap">
      <div className="my-list">
        <VariableSizeList
          ref={ref}
          listData={listData}
          estimatedItemSize={90}
          bufferScale={1}
          pullDownCallback={requestTopData}
          pullUpCallback={requestBottomData}
          hasMoreTopData={hasMoreTopData}
          hasMoreBottomData={hasMoreBottomData}
          loaderAtTop={
            <div className="my-list-loader">
              {hasMoreTopData ? 'loading...' : 'No more !'}
            </div>
          }
          loaderAtBottom={
            <div className="my-list-loader">
              {hasMoreBottomData ? 'loading...' : 'No more !'}
            </div>
          }
        >
          {Row}
        </VariableSizeList>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="number">数字:</label>
          <input
            id="number"
            defaultValue={inputValue}
            onChange={e => setInputValue(+e.target.value)}
          />
          <button type="submit">提交</button>
        </form>
      </div>
    </div>
  );
};

ReactDOM.render(<VariableSizeListExample />, document.getElementById('root'));
