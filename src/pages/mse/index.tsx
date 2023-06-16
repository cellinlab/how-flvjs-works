import { useState, useRef } from "react";
import { Button, TextField, Box, Alert } from "@mui/material";

//@ts-ignore
import FetchStreamLoader from "../../lib/flvjs/src/io/fetch-stream-loader.js";
//@ts-ignore
import RangeSeekHandler from "../../lib/flvjs/src/io/range-seek-handler.js";
//@ts-ignore
import FLVDemuxer from "../../lib/flvjs/src/demux/flv-demuxer.js";
//@ts-ignore
import MP4Remuxer from "../../lib/flvjs/src/remux/mp4-remuxer.js";
//@ts-ignore
import MSEController from "../../lib/flvjs/src/core/mse-controller.js";

const Mse = () => {
  const [url, setUrl] = useState(
    "https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv"
  );
  const loaderRef = useRef(null);
  const demuxerRef = useRef(null);
  const remuxerRef = useRef(null);
  const mseControllerRef = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    const demuxer = new FLVDemuxer(config);
    const remuxer = new MP4Remuxer(config);
    const mseController = new MSEController(config);

    mseController.attachMediaElement(videoRef.current);

    loader.onDataArrival = (chunk: any, byteStart: any) => {
      console.log("---- onDataArrival ----");
      console.log("onDataArrival params [chunk]: ", chunk);
      console.log("onDataArrival params [byteStart]: ", byteStart);

      if (demuxerRef.current) {
        // @ts-ignore
        demuxerRef.current.parseChunks(chunk, byteStart);
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
    };

    demuxer.onMediaInfo = (mediaInfo: any) => {
      console.log("---- onMediaInfo ----");
      console.log("onMediaInfo params [mediaInfo]: ", mediaInfo);
    };
    demuxer.onTrackMetadata = (type: any, metadata: any) => {
      console.log("---- onTrackMetadata ----");
      console.log("onTrackMetadata params [type]: ", type);
      console.log("onTrackMetadata params [metadata]: ", metadata);

      if (remuxerRef.current) {
        // @ts-ignore
        remuxerRef.current._onTrackMetadataReceived(type, metadata);
      }
    };
    demuxer.onDataAvailable = (videoData: any, audioData: any) => {
      console.log("---- onDataAvailable ----");
      console.log("onDataAvailable params [videoData]: ", videoData);
      console.log("onDataAvailable params [audioData]: ", audioData);

      if (remuxerRef.current) {
        // @ts-ignore
        remuxerRef.current.remux(videoData, audioData);
      }
    };
    demuxer.onError = (type: any, info: any) => {
      console.log("---- onError ----");
      console.log("onError params [type]: ", type);
      console.log("onError params [info]: ", info);
    };

    remuxer.onInitSegment = (type: any, initSegment: any) => {
      console.log("---- onInitSegment ----");
      console.log("onInitSegment params [type]: ", type);
      console.log("onInitSegment params [initSegment]: ", initSegment);

      if (mseControllerRef.current) {
        console.log("appendInitSegment");
        // @ts-ignore
        mseControllerRef.current.appendInitSegment(initSegment);
      }
    };
    remuxer.onMediaSegment = (type: any, mediaSegment: any) => {
      console.log("---- onMediaSegment ----");
      console.log("onMediaSegment params [type]: ", type);
      console.log("onMediaSegment params [mediaSegment]: ", mediaSegment);

      console.log(mseControllerRef.current);
      if (mseControllerRef.current) {
        console.log("appendMediaSegment");
        // @ts-ignore
        mseControllerRef.current.appendMediaSegment(mediaSegment);
      }
    };

    loaderRef.current = loader;
    demuxerRef.current = demuxer;
    remuxerRef.current = remuxer;
    mseControllerRef.current = mseController;

    console.log("Init loader and demuxer success");
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

    // @ts-ignore
    loaderRef.current?.open(dataSource, range);
  };

  return (
    <>
      <h1 className="text-2xl">MP4 Remuxer</h1>
      <div className="flex flex-col p-4">
        <Box className="w-full mt-4">
          <Alert severity="info">Open the console to view details !</Alert>
        </Box>
        <Box className="w-full mt-4">
          <TextField
            fullWidth
            label="Url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            variant="outlined"
          />
        </Box>
        <Box className="w-full mt-4 flex">
          <Box className="mr-2">
            <Button variant="contained" onClick={handleInit}>
              Init
            </Button>
          </Box>
          <Box>
            <Button variant="contained" onClick={handleLoad}>
              Load
            </Button>
          </Box>
        </Box>
        <Box className="w-full mt-4">
          <video ref={videoRef} className="block mx-auto" controls>
            Your browser does not support the video tag.
          </video>
        </Box>
      </div>
    </>
  );
};

export default Mse;
