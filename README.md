# How flv.js works

Welcome to the "how-flvjs-works" repository!🎉

This project provides a straightforward understanding of [flv.js](https://github.com/bilibili/flv.js), an HTML5 Flash Video (FLV) Player written in pure JavaScript without Flash. , using code analysis📝 and a simple online demo💻.

## Architecture

### Official Architecture Diagram

![flv.js architecture](./docs/architecture.png)

### Initialization Sequence Diagram

```mermaid
sequenceDiagram
  	participant Browser
    participant videoElement
    participant FlvPlayer
    participant MSEController
    participant MediaSource

  	Browser ->> FlvPlayer: player.attachMediaElement(element)
    videoElement ->> FlvPlayer: attachMediaElement(mediaElement)
    FlvPlayer ->> MSEController: this._msectl = new MSEController(this._config)
    MSEController ->> MediaSource: this._mediaSource = new window.MediaSource()
    MediaSource ->> videoElement: mediaElement.src = this._mediaSourceObjectURL

```

### Video loading Sequence Diagram

```mermaid
sequenceDiagram
    participant VideoElement
    participant FlvPlayer
    participant MSEController
    participant Transmuxer
    participant TransmuxingController
    participant IO Loaders
    participant IOController
    participant FLVDemuxer
    participant MP4Remuxer
    participant MediaSource
    participant VideoServer

    VideoElement->>FlvPlayer: Request video playback
    FlvPlayer->>Transmuxer: Initialize transmuxer
    Transmuxer->>TransmuxingController: Start transmuxing
    TransmuxingController->>IOController: Initiate data loading request
    IOController->>IO Loaders: Load video data
    IO Loaders->>VideoServer: Request video data
    VideoServer-->>IO Loaders: Return video data
    IO Loaders->>IOController: Return loaded video data
    IOController->>TransmuxingController: Pass loaded video data
    TransmuxingController->>FLVDemuxer: Parse FLV data
    FLVDemuxer->>MP4Remuxer: Convert to MP4 format
    MP4Remuxer->>TransmuxingController: Return remuxed data
    TransmuxingController->>FlvPlayer: Pass remuxed data
    FlvPlayer->>MSEController: Append media segment
    MSEController->>MediaSource: Add media segment to MediaSource
    MediaSource->>VideoElement: Update video source


```

Another way to show the sequence diagram:

```mermaid
graph TD
    subgraph Browser
        A[VideoElement]
    end

    subgraph Flv.js
        B[FlvPlayer]
        C[MSEController]
        D[Transmuxer]
        E[TransmuxingController]
        F[IO Loaders]
        G[IOController]
        H[FLVDemuxer]
        I[MP4Remuxer]
    end

    subgraph Server
        J[VideoServer]
    end

    subgraph Media
        K[MediaSource]
    end

    A -->|1. Request video playback| B
    B -->|2. Initialize transmuxer| D
    D -->|3. Start transmuxing| E
    E -->|4. Initiate data loading request| G
    G -->|5. Load video data| F
    F -->|6. Request video data| J
    J -->|7. Return video data| F
    F -->|8. Return loaded video data| G
    G -->|9. Pass loaded video data| E
    E -->|10. Parse FLV data| H
    H -->|11. Convert to MP4 format| I
    I -->|12. Return remuxed data| E
    E -->|13. Pass remuxed data| B
    B -->|14. Append media segment| C
    C -->|15. Add media segment to MediaSource| K
    K -->|16. Update video source| A

```

## Code Analysis and Demo Explanation

### Loading data from server

```mermaid
sequenceDiagram
  participant IOController
  participant FetchStreamLoader
  participant FetchAPI
  participant SeekHandler

  IOController->>FetchStreamLoader: open(dataSource, range)
  FetchStreamLoader->>SeekHandler: getConfig(sourceURL, range)
  SeekHandler->>FetchStreamLoader: seekConfig
  FetchStreamLoader->>FetchAPI: fetch(seekConfig.url, params)
  FetchAPI->>FetchStreamLoader: res
  FetchStreamLoader->>FetchAPI: check response status and validity
  FetchStreamLoader->>+FetchAPI: res.ok && (res.status >= 200 && res.status <= 299)
  FetchAPI->>FetchStreamLoader: res.body.getReader()
  FetchStreamLoader->>FetchAPI: pump(reader)
  FetchAPI-->>FetchStreamLoader: chunk
  FetchStreamLoader->>IOController: onDataArrival(chunk, byteStart, receivedLength)
  FetchAPI-->>FetchStreamLoader: chunk (next iteration)
  FetchStreamLoader-->>FetchAPI: continue pumping
  FetchAPI-->>FetchStreamLoader: result.done=true
  FetchStreamLoader->>FetchAPI: handle end of stream
  FetchAPI-->>FetchStreamLoader: contentLength != null && receivedLength < contentLength
  FetchStreamLoader-->>FetchAPI: report Early-EOF
  FetchAPI-->>FetchStreamLoader: contentLength=null || receivedLength >= contentLength
  FetchStreamLoader->>FetchAPI: handle complete download
  FetchAPI-->>FetchStreamLoader: notify download completion
  FetchStreamLoader->>IOController: onComplete(from, to)
  FetchStreamLoader-->>IOController: download complete
  FetchAPI-->>FetchStreamLoader: res.ok=false or (res.status < 200 || res.status > 299)
  FetchStreamLoader->>IOController: onError(HTTP_STATUS_CODE_INVALID, { code, msg })
  FetchStreamLoader-->>IOController: error occurred
```

See Demo: [Loading data from server](https://how-flvjs-works.cellinlab.com/data).

### Parse FLV data

```mermaid
sequenceDiagram
    participant IOController
    participant TransmuxingController
    participant FLVDemuxer
    participant MP4Remuxer

    Note over IOController: Received ArrayBuffer
    IOController->>TransmuxingController: Data Ready event
    TransmuxingController->>FLVDemuxer: Call _demuxFLV() with ArrayBuffer
    FLVDemuxer->>FLVDemuxer: Parse FLV header information
    loop Parse FLV tags
        FLVDemuxer->>FLVDemuxer: Parse tag type, data size, timestamp, etc.
        alt Tag type is audio
            FLVDemuxer->>FLVDemuxer: Parse audio data
        else Tag type is video
            FLVDemuxer->>FLVDemuxer: Parse video data
        end
    end

    FLVDemuxer-->>TransmuxingController: Send audio data
    TransmuxingController->>MP4Remuxer: Process audio data
    FLVDemuxer-->>TransmuxingController: Send video data
    TransmuxingController->>MP4Remuxer: Process video data

    alt Initial media metadata dispatched
        TransmuxingController->>MP4Remuxer: Send audio track data
        MP4Remuxer->>MP4Remuxer: Process audio data
        TransmuxingController->>MP4Remuxer: Send video track data
        MP4Remuxer->>MP4Remuxer: Process video data
    else Initial media metadata not dispatched
        TransmuxingController-->>TransmuxingController: Update media metadata
        alt Both audio and video tracks exist
            TransmuxingController-->>MP4Remuxer: Send audio track data
            MP4Remuxer->>MP4Remuxer: Process audio data
            TransmuxingController-->>MP4Remuxer: Send video track data
            MP4Remuxer->>MP4Remuxer: Process video data
            TransmuxingController-->>TransmuxingController: Dispatch initial media metadata
        else Only audio track exists
            TransmuxingController-->>MP4Remuxer: Send audio track data
            MP4Remuxer->>MP4Remuxer: Process audio data
            TransmuxingController-->>TransmuxingController: Dispatch initial media metadata
        end
    end
```
