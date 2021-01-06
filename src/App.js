import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
// import { Transition } from 'react-transition-group';
import { Player } from "textalive-app-api";
import { Container, Typography, Divider, Grid } from '@material-ui/core';
import MediaControlCard from './Card';
import BlackCurtain from './BlackCurtain';

export const LyricsContainer = styled(Grid)`
  display: flex;
  flex-wrap: wrap;
  padding: 2px 1%;
  max-width: 95%;
`;

// ビート毎に右に広げてフェードアウト
export const showBeatBar = keyframes`
  0% {
    width: 0;
    opacity: 1;
  }
  50% {
    width: 100%;
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0;
  }
`;

export const BeatBar = styled(Divider)`
  animation: ${showBeatBar} infinite .4s linear;
`;

// 歌詞を下からフェード
export const showLyrics = keyframes`
  from {
    transform: translate3d(0, 100%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
  `;

export const LyricTypography = styled(Typography)`
  animation: ${showLyrics} .3s;
`;

const App = () => {
  const [player, setPlayer] = useState(null);
  const [app, setApp] = useState(null);
  const [artist, setArtist] = useState(false);
  const [title, setTitle] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [mediaElement, setMediaElement] = useState(null);

  const MediaBox = useMemo(() => <div className="media" ref={setMediaElement} />, [])
  let b,c;
  // const songUrl = 'https://www.youtube.com/watch?v=PqJNc9KVIZE' // Tell Your World
  // const songUrl = 'https://www.youtube.com/watch?v=kp-plPYAPq8' // ロミオとシンデレラ
  // const songUrl = 'https://www.youtube.com/watch?v=o1jAMSQyVPc' // メルト
  const songUrl = 'https://www.youtube.com/watch?v=shs0rAiwsGQ' // 千本桜

  useEffect(() => {
    // if (typeof window === "undefined" || !mediaElement) {
    //   return;
    // }

    const player = new Player({ app: {
      appName: "mikumiku",
      appAuthor: "Shotaro Shimai",
    }, mediaElement });

    const eventListner = {
      // APIの準備ができたら呼ばれる
      onAppReady: (app) => {
        console.log("--- AppReady ---");
        console.log("managed:", app.managed);
        console.log("host:", app.host);
        console.log("song url:", app.songUrl);
        if (!app.songUrl) {
          player.createFromSongUrl(songUrl);
        }
        setApp(app);
      },
      // 楽曲情報読み込み完了後、呼ばれる
      // この時点ではrequestPlay()等が実行不能
      onVideoReady: (v) => {
        console.log('--- VideoReady ---');
        console.log("player.data.song:", player.data.song);
        console.log("player.data.song.name:", player.data.song.name);
        console.log("player.data.song.artist.name:", player.data.song.artist.name);
        console.log("player.data.songMap:", player.data.songMap);
        // let c = player.video.firstChar;
        // while (c && c.next) {
        //   c.animate = (now, u) => {
        //     if (u.startTime <= now && u.endTime > now) {
        //       setChar(u.text);
        //     }
        //   };
        //   c = c.next;
        // }
      },
      onTimerReady: () => {
        console.log('--- TimerReady ---');
        setTitle(player.data.song.name);
        setArtist(player.data.song.artist.name);
        // setVideoState(true)
        // player.requestPlay();
      },
      // 楽曲の再生が始まったら呼ばれる
      onPlay: () => {
        console.log('--- Play ---');
        setIsPlayingVideo(true)
      },
      // 楽曲の再生が止まったら呼ばれる
      onPause: () => {
        console.log('--- Pause ---');
        setIsPlayingVideo(false)
      },
      // 再生コントロールができるようになったら呼ばれる
      // これ以降、requestPlay()等が実行可能
      // 楽曲が変わったら呼ばれる
      onAppMediaChange: (songUrl) => {
        console.log("新しい再生楽曲が指定されました:", songUrl);
        resetChars();
      },
      // 再生位置の情報が更新されたら呼ばれる
      onTimeUpdate: (position) => {
        // 現在のビート情報を取得
        let beat = player.findBeat(position);
        if (b !== beat) {
          b = beat;
        }
        // 歌詞情報がなければこれで処理を終わる
        if (!player.video.firstChar) {
          setErrorState(true)
          return;
        }
        // 巻き戻っていたら歌詞表示をリセットする
        if (c && c.startTime > position + 1000) {
          resetChars();
        }
        // 500ms先に発声される文字を取得
        let currentChar = c || player.video.firstChar;
        while (currentChar && currentChar.startTime < position + 500) {
          // 新しい文字が発声されようとしている
          if (c !== currentChar) {
            newChar(currentChar);
            c = currentChar;
          }
          currentChar = currentChar.next;
        }
      },
    }

    player.addListener(eventListner);
    setPlayer(player);
    // return () => {
    //   console.log("--- [app] shutdown ---");
    //   p.removeListener(playerListener);
    //   p.dispose();
    // };
  }, [mediaElement])

  const requestPlay = () => {
    if (player) {
      player.requestPlay();
      setIsPlayingVideo(true);
    }
  }

  const requestPause = () => {
    if (player) {
      player.requestPause();
      setIsPlayingVideo(false);
    }
  }

  const requestStop = () => {
    if (player) {
      player.requestStop();
      setIsPlayingVideo(false);
      resetChars();
    }
  }

  const resetChars = () => {
    c = null;
    setLyrics([]);
  }

  const newChar = (currentChar) => {
    // 品詞 (part-of-speech)
    // https://developer.textalive.jp/packages/textalive-app-api/interfaces/iword.html#pos
    let noun, lastChar;
    if (
      currentChar.parent.pos === "N" ||
      currentChar.parent.pos === "PN"
      // currentChar.parent.pos === "X"
    ) {
      noun = true
    } else {
      noun = false
    }
    if (currentChar.parent.parent.lastChar === currentChar) {
      lastChar = true
    } else {
      lastChar = false
    }
    console.log(currentChar.text)
    setLyrics(lyrics => [...lyrics, { char: currentChar.text, noun: noun, lastChar: lastChar}])
  }


  return (
    <Grid
      className='App'
      style={{
        minHeight: '100vh',
        backgroundColor: '#077',
        // backgroundImage: 'linear-gradient(0deg, rgba(0,119,119,1) 0%, rgba(0,177,160,1) 100%)',
        backgroundImage: 'linear-gradient(#86cecb, #137a7f)',
        backgroundAttachment: 'fixed',
        height: '40vmin',
      }}
    >
      <MediaControlCard
        title={title}
        artist={artist}
        isPlayingVideo={isPlayingVideo}
        requestPlay={requestPlay}
        requestPause={requestPause}
        requestStop={requestStop}
      />
      { !artist && !title && (<BlackCurtain />)}
      <Container style={{ maxWidth: '95%', paddingTop: '80px' }}>
        <div style={{ position: 'fixed', bottom: '1%', right: '1%', zIndex: 100 }}>{MediaBox}</div>
        {/* <MediaBox style={{ position: 'fixed', bottom: '0%', left: '0%', height: 500, width: 500, backgroundColor: 'pink', zIndex: 20 }}/> */}
        <LyricsContainer>
        {errorState &&
          <Typography
            component="div"
            style={{
              height: '45px',
              fontWeight: 'bold',
              fontSize: '36px',
              fontFamily: 'M PLUS 1p',
              color: '#fcd',
            }}
          >
            歌詞情報が登録されていません。
          </Typography>
        }
          {lyrics.map((item, index) => {
            return (
              <LyricTypography
                key={index}
                component="div"
                style={{
                  height: '45px',
                  fontWeight: 'bold',
                  fontSize: '36px',
                  fontFamily: 'M PLUS 1p',
                  color: item.noun ? '#fcd' : '#aff',
                }}
              >
                {item.char}{item.lastChar && '　'}
              </LyricTypography>
            )
          })}
        </LyricsContainer>
        { isPlayingVideo && <BeatBar style={{ backgroundColor: "#aff", height: 8 }}/> }
      </Container>
    </Grid>
  );
}

export default App;
