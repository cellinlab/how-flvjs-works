import { useState, useRef, useEffect } from "react";
import { Button, TextField, FormControlLabel, Checkbox, Box, Tab, Tabs } from "@mui/material";
import FlvJs from "flv.js";

import { useLocalStorage } from "../../hooks";
import TabPanel from "../../components/TabPanel";

const Home = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<FlvJs.Player | null>(null);
  const logBoxRef = useRef<HTMLTextAreaElement>(null);
  const [isLive, setIsLive] = useLocalStorage("isLive", false);
  const [withCredentials, setWithCredentials] = useLocalStorage("withCredentials", false);
  const [hasAudio, setHasAudio] = useLocalStorage("hasAudio", true);
  const [hasVideo, setHasVideo] = useLocalStorage("hasVideo", true);
  const [inputMode, setInputMode] = useLocalStorage("inputMode", "StreamURL");
  const [sURL, setSURL] = useLocalStorage("sURL", "");
  const [msURL, setMsURL] = useLocalStorage("msURL", "");
  const [log, setLog] = useState("");
  const [seekPoint, setSeekPoint] = useState("0");

  useEffect(() => {
    initLogListener();
    return () => {
      flvDestroy();
    };
  }, []);

  const initLogListener = () => {
    FlvJs.LoggingControl.addLogListener((type, str) => {
      setLog((log) => log + str + "\n");
      if (logBoxRef.current) {
        logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
      }
    });
  };

  const switchInputMode = () => {
    if (inputMode === "StreamURL") {
      setInputMode("MediaDataSource");
    } else {
      setInputMode("StreamURL");
    }
  };

  const flvLoad = () => {
    console.log(`isSupported: ${FlvJs.isSupported()}`);
    if (inputMode === "MediaDataSource") {
      const xhr = new XMLHttpRequest();
      console.log("xhr GET url: ", msURL);
      xhr.open("GET", msURL, true);
      xhr.onload = function () {
        const mediaDataSource = JSON.parse(xhr.response);
        console.log("xhr get mediaDataSource: ", mediaDataSource);
        flvLoadMDS(mediaDataSource);
      };
      xhr.send();
    } else {
      const mediaDataSource = {
        type: "flv",
        url: sURL,
        isLive: isLive,
        withCredentials: withCredentials,
        hasAudio: hasAudio,
        hasVideo: hasVideo,
      };
      flvLoadMDS(mediaDataSource);
    }
  };

  const flvLoadMDS = (mds: any) => {
    let element: HTMLMediaElement;
    if (videoRef.current) {
      element = videoRef.current;
    } else {
      console.log("videoRef.current is null");
      return;
    }
    if (typeof playerRef.current !== "undefined") {
      if (playerRef.current != null) {
        playerRef.current.unload();
        playerRef.current.detachMediaElement();
        playerRef.current.destroy();
        playerRef.current = null;
      }
    }
    const flvPlayer = FlvJs.createPlayer(mds, {
      enableWorker: false,
      lazyLoadMaxDuration: 3 * 60,
      seekType: "range",
    });
    flvPlayer.attachMediaElement(element);
    flvPlayer.load();
    playerRef.current = flvPlayer;
  };

  const flvStart = () => {
    playerRef.current && playerRef.current.play();
  };

  const flvPause = () => {
    playerRef.current && playerRef.current.pause();
  };

  const flvDestroy = () => {
    if (playerRef.current !== null) {
      playerRef.current.pause();
      playerRef.current.unload();
      playerRef.current.detachMediaElement();
      playerRef.current.destroy();
      playerRef.current = null;
    }
  };

  const flvSeekTo = () => {
    if (playerRef.current != null) {
      playerRef.current.currentTime = parseFloat(seekPoint);
    }
  };

  return (
    <>
      <h1 className="text-2xl">Official Demo</h1>
      <div className="flex flex-col">
        <div className="input-options mb-4">
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Tabs
              value={inputMode}
              onChange={switchInputMode}
              aria-label="basic tabs example"
              centered
            >
              <Tab label="StreamURL" value="StreamURL" />
              <Tab label="MediaDataSource" value="MediaDataSource" />
            </Tabs>
          </Box>
          <TabPanel value={inputMode} index={"StreamURL"}>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <Box mr={2} className="flex-1">
                  <TextField
                    id="outlined-basic"
                    label="URL"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={sURL}
                    onChange={(e) => setSURL(e.target.value)}
                  />
                </Box>
                <Box>
                  <Button variant="contained" onClick={() => setSURL("")}>
                    Clear
                  </Button>
                </Box>
              </div>
              <div className="flex flex-row">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isLive}
                      onChange={(e) => setIsLive(e.target.checked)}
                      name="isLive"
                    />
                  }
                  label="isLive"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={withCredentials}
                      onChange={(e) => setWithCredentials(e.target.checked)}
                      name="withCredentials"
                    />
                  }
                  label="withCredentials"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasAudio}
                      onChange={(e) => setHasAudio(e.target.checked)}
                      name="hasAudio"
                    />
                  }
                  label="hasAudio"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasVideo}
                      onChange={(e) => setHasVideo(e.target.checked)}
                      name="hasVideo"
                    />
                  }
                  label="hasVideo"
                />
              </div>
            </div>
          </TabPanel>
          <TabPanel value={inputMode} index={"MediaDataSource"}>
            <div className="flex">
              <TextField
                id="outlined-basic"
                label="URL"
                variant="outlined"
                fullWidth
                value={msURL}
                onChange={(e) => setMsURL(e.target.value)}
              />
              <Button variant="contained" onClick={() => setMsURL("")}>
                Clear
              </Button>
            </div>
          </TabPanel>
        </div>
        <div className="video-wrap  mb-4">
          <div className="video-container">
            <video ref={videoRef} className="block mx-auto" controls>
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="interact-options mb-4">
          <div className="flex">
            <Box mr={2}>
              <Button variant="contained" onClick={flvLoad}>
                Load
              </Button>
            </Box>
            <Box mr={2}>
              <Button variant="contained" onClick={flvStart}>
                Start
              </Button>
            </Box>
            <Box mr={2}>
              <Button variant="contained" onClick={flvPause}>
                Pause
              </Button>
            </Box>
            <Box mr={2}>
              <Button variant="contained" onClick={flvDestroy}>
                Destroy
              </Button>
            </Box>
            <Box mr={1}>
              <TextField
                id="outlined-basic"
                label="Seek Point"
                variant="outlined"
                size="small"
                value={seekPoint}
                onChange={(e) => setSeekPoint(e.target.value)}
              />
            </Box>
            <Box>
              <Button variant="contained" onClick={flvSeekTo}>
                SeekTo
              </Button>
            </Box>
          </div>
        </div>
        <div className="log-wrap">
          <textarea value={log} rows={10} readOnly ref={logBoxRef} className="w-full"></textarea>
        </div>
      </div>
    </>
  );
};

export default Home;
