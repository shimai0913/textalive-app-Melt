import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import { Card, CardContent, IconButton, Typography, Divider } from '@material-ui/core';
// import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
// import SkipNextIcon from '@material-ui/icons/SkipNext';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    display: 'flex',
    display: 'inline-block',
    opacity: 0.9,
    marginTop: 10,
  },
  details: {
    display: 'flex',
    flexDirection: 'row',
  },
  content: {
    flex: '1 0 auto',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '24px 16px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export const Meta = styled(CardContent)`
`;

const MediaControlCard = (props) => {
  const classes = useStyles();
  // const theme = useTheme();
  const { title, artist, isPlayingVideo, requestPlay, requestPause, requestStop } = props;

  return (
    <Card className={classes.root}>
      <div className={classes.details} style={{ backgroundColor: '#000c', height: 50 }}>
        <div className={classes.controls}>
          {/* <IconButton aria-label="previous">
            {theme.direction === 'rtl' ? <SkipNextIcon /> : <SkipPreviousIcon />}
          </IconButton> */}
          <IconButton aria-label="play/pause">
            { !isPlayingVideo ? (
              <PlayArrowIcon fontSize="small" style={{ color: '#fff' }} onClick={() => requestPlay()} />
            ) : (
              <PauseIcon fontSize="small" style={{ color: '#fff' }} onClick={() => requestPause()} />
            )}
          </IconButton>
          <IconButton aria-label="stop">
            <StopIcon fontSize="small" style={{ color: '#fff' }} onClick={() => requestStop()} />
          </IconButton>
          {/* <IconButton aria-label="next">
            {theme.direction === 'rtl' ? <SkipPreviousIcon /> : <SkipNextIcon />}
          </IconButton> */}
          <Divider flexItem orientation='vertical' style={{ marginTop:5, backgroundColor:'#fff' }} />
        </div>
        <Meta className={classes.content}>
          <Typography style={{ fontSize: 12, }} >
            Title: { title ? title : '-' }
          </Typography>
          <Typography style={{ fontSize: 12, }} >
            Artist: { artist ? artist : '-' }
          </Typography>
        </Meta>
      </div>
      {/* <CardMedia
        className={classes.cover}
        image="/static/images/cards/live-from-space.jpg"
        title="Live from space album cover"
      /> */}
    </Card>
  );
}

export default MediaControlCard;
