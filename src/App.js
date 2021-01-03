import React, { useState, useEffect, useRef } from 'react';
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
  // const songUrl = 'https://www.youtube.com/watch?v=PqJNc9KVIZE' // Tell Your World
  // const songUrl = 'https://www.youtube.com/watch?v=kp-plPYAPq8' // ロミオとシンデレラ
  // const songUrl = 'https://www.youtube.com/watch?v=o1jAMSQyVPc' // メルト
  const songUrl = 'https://www.youtube.com/watch?v=shs0rAiwsGQ' // 千本桜
  const [artist, setArtist] = useState(false);
  const [title, setTitle] = useState(false);
  const [videoState, setVideoState] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [errorState, setErrorState] = useState(false);
  // const player = new Player({ app: true });
  const [player, setPlayer] = useState(new Player({ app: true, mediaBannerPosition: null }));

  let b,c;

  const requestPlay = () => {
    player.requestPlay();
    setIsPlayingVideo(true);
  }

  const requestPause = () => {
    player.requestPause();
    setIsPlayingVideo(false);
  }

  const requestStop = () => {
    player.requestStop();
    setIsPlayingVideo(false);
    resetChars();
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
    setLyrics(lyrics => [...lyrics, { char: currentChar.text, noun: noun, lastChar: lastChar}])
  }

  useEffect(() => {
    player.addListener({
      // APIの準備ができたら呼ばれる
      onAppReady: (app) => {
        // console.log(app.songUrl)
        if (app.managed) {
          // ホストが存在する
          console.log('App Ready');
        } else {
          console.log('App not Ready');
          player.createFromSongUrl(songUrl);
        }
      },

      // 楽曲が変わったら呼ばれる
      onAppMediaChange: (songUrl) => {
        console.log("新しい再生楽曲が指定されました:", songUrl);
        resetChars();
      },

      // 楽曲情報読み込み完了後、呼ばれる
      // この時点ではrequestPlay()等が実行不能
      onVideoReady: (v) => {
        console.log('Video Ready');
        setTitle(player.data.song.name);
        setArtist(player.data.song.artist.name);
      },

      // 楽曲の再生が始まったら呼ばれる
      onPlay: () => {
        console.log('Video play');
        setIsPlayingVideo(true)
      },

      // 楽曲の再生が止まったら呼ばれる
      onPause: () => {
        console.log('Video pause');
        setIsPlayingVideo(false)
      },

      // 再生コントロールができるようになったら呼ばれる
      // これ以降、requestPlay()等が実行可能
      onTimerReady: () => {
        console.log('TimerReady');
        setVideoState(true)
        player.requestPlay();
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
    });
  }, [])

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
      { !videoState ? (
        <BlackCurtain />
      ) : (
        <>
          <Container style={{ maxWidth: '95%', paddingTop: '80px' }}>
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
        </>
      )}
    </Grid>
  );
}

export default App;
