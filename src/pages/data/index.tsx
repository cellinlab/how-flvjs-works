import { useRef, useState } from "react";
//@ts-ignore
import FetchStreamLoader from "../../lib/flvjs/src/io/fetch-stream-loader.js";
//@ts-ignore
import RangeSeekHandler from "../../lib/flvjs/src/io/range-seek-handler.js";

import { TextField, Button, Box } from "@mui/material";

import HexViewer from "../../components/HexViewer/index.js";
import type { HexViewerRef } from "../../components/HexViewer/index.js";

const Data = () => {
  const [url, setUrl] = useState(
    "https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv"
  );
  const chunkArray = useRef<ArrayBuffer[]>([]);
  const loaderRef = useRef(null);

  const hexViewerRef = useRef<HexViewerRef | null>(null);

  const handleAddDataToHexViewer = (data: any) => {
    if (hexViewerRef.current) {
      hexViewerRef.current.addData(data);
    }
  };

  const handleClearHexViewer = () => {
    if (hexViewerRef.current) {
      hexViewerRef.current.clearData();
    }
  };

  const handleInit = () => {
    if (loaderRef.current) {
      return;
    }

    const config = {
      enableWorker: false,
      enableStashBuffer: true,
      isLive: false,
      lazyLoad: true,
      lazyLoadMaxDuration: 180,
      lazyLoadRecoverDuration: 30,
      deferLoadAfterSourceOpen: true,
      autoCleanupMaxBackwardDuration: 180,
      autoCleanupMinBackwardDuration: 120,
      statisticsInfoReportInterval: 600,
      fixAudioTimestampGap: true,
      accurateSeek: false,
      seekType: "range",
      seekParamStart: "bstart",
      seekParamEnd: "bend",
      rangeLoadZeroStart: false,
      reuseRedirectedURL: false,
    };

    const seekHandler = new RangeSeekHandler(config.rangeLoadZeroStart);

    const loader = new FetchStreamLoader(seekHandler, config);
    loader.onDataArrival = (chunk: any, byteStart: any) => {
      console.log("---- onDataArrival ----");
      console.log("onDataArrival params [chunk]: ", chunk);
      console.log("onDataArrival params [byteStart]: ", byteStart);
      if (chunkArray.current) {
        chunkArray.current.push(chunk);
      }
    };
    loader.onContentLengthKnown = (contentLength: any) => {
      console.log("---- onContentLengthKnown ----");
      console.log("onContentLengthKnown params [contentLength]: ", contentLength);
    };
    loader.onError = (type: any, data: any) => {
      console.log("---- onError ----");
      console.log("onError params [type]: ", type);
      console.log("onError params [data]: ", data);
    };
    loader.onComplete = (from: any, to: any) => {
      console.log("---- onComplete ----");
      console.log("onComplete params [from]: ", from);
      console.log("onComplete params [to]: ", to);
      if (chunkArray.current) {
        handleAddDataToHexViewer(chunkArray.current[0]);
      }
    };

    loaderRef.current = loader;

    console.log("init success");
  };

  const handleLoad = () => {
    if (!loaderRef.current) {
      return;
    }

    const dataSource = {
      cors: true,
      timestampBase: 0,
      url: url,
      withCredentials: false,
    };
    const range = {
      from: 0,
      to: -1,
    };

    loaderRef.current?.open(dataSource, range);
  };

  return (
    <>
      <h1 className="text-2xl">Data Loading</h1>
      <div className="flex flex-col p-4">
        <Box className="w-full mt-4">
          <TextField
            className="w-full"
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            variant="outlined"
          />
        </Box>
        <Box className="w-full mt-4 flex">
          <Box className="mr-2">
            <Button
              variant="contained"
              onClick={() => {
                handleInit();
              }}
            >
              Init
            </Button>
          </Box>
          <Box className="mr-2">
            <Button
              variant="contained"
              onClick={() => {
                handleLoad();
              }}
            >
              Load
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                handleClearHexViewer();
              }}
            >
              Clear Viewer
            </Button>
          </Box>
        </Box>
        <Box className="w-full mt-4">
          <HexViewer ref={hexViewerRef} />
        </Box>
      </div>
    </>
  );
};

export default Data;
