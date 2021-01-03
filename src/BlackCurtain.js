import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CircularProgress, Grid, Typography } from '@material-ui/core';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';


export const TextContainer = styled(Grid)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  color: #fff;
`;

const BlackCurtain = () => {

  return (
    <div style={{
      backgroundColor: 'black',
      opacity: 0.3,
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // width: '100%',
    }}>
      <TextContainer>
        <CircularProgress style={{color: '#fff', marginRight: '10px' }} />
        <Typography component="div" style={{fontSize: '50px'}}>Loading...</Typography>
        <HourglassEmptyIcon style={{ fontSize: '60px'}} />
      </TextContainer>
    </div>
  );
}

export default BlackCurtain;
