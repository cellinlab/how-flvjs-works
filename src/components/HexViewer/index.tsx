import React, { useState } from "react";

import { bufferToHexStr } from "../../utils";

interface HexViewerProps {
  width?: number;
  height?: number;
}

interface HexViewerRef {
  addData: (data: ArrayBuffer) => void;
  clearData: () => void;
}

const HexViewer = React.forwardRef(({ width = 400, height = 600 }: HexViewerProps, ref) => {
  const [data, setData] = useState<string | null>(null);

  const addData = (newData: ArrayBuffer) => {
    const hexArray = bufferToHexStr(newData);
    console.log("hexArray: ", hexArray);
    setData(hexArray.join(" "));
  };
  const clearData = () => {
    setData(null);
  };

  React.useImperativeHandle(ref, () => ({
    addData,
    clearData,
  }));

  return (
    <textarea style={{ width, height }} value={data ? data : ""} readOnly rows={20}></textarea>
  );
});

export type { HexViewerRef };

export default HexViewer;
