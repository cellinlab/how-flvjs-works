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

    VideoElement->>FlvPlayer: 请求视频播放
    FlvPlayer->>Transmuxer: 初始化转封装器
    Transmuxer->>TransmuxingController: 开始转封装
    TransmuxingController->>IOController: 发起数据加载请求
    IOController->>IO Loaders: 加载视频数据
    IO Loaders->>VideoServer: 请求视频数据
    VideoServer-->>IO Loaders: 返回视频数据
    IO Loaders->>IOController: 返回加载的视频数据
    IOController->>TransmuxingController: 传递加载的视频数据
    TransmuxingController->>FLVDemuxer: 解析 FLV 数据
    FLVDemuxer->>MP4Remuxer: 转换为 MP4 格式
    MP4Remuxer->>TransmuxingController: 返回转封装后的数据
    TransmuxingController->>FlvPlayer: 传递转封装后的数据
    FlvPlayer->>MSEController: 添加媒体片段
    MSEController->>MediaSource: 向媒体源添加媒体片段
    MediaSource->>VideoElement: 更新视频源

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
