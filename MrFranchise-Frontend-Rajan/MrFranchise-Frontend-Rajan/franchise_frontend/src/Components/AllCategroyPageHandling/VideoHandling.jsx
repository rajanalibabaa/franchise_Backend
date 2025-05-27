import React, { useRef, useState } from 'react';
import {
  Box, Card, CardContent, Grid, IconButton, Slider, Typography, CircularProgress, Menu, MenuItem
} from '@mui/material';
import {
  PlayArrow, Pause, VolumeUp, VolumeOff, ZoomOutMap, Speed
} from '@mui/icons-material';

const CustomVideoPlayer = ({ url, title }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [anchorEl, setAnchorEl] = useState(null);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const changeSpeed = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setAnchorEl(null);
    }
  };

  const handleVolume = (e, newValue) => {
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      setVolume(newValue);
      setMuted(newValue === 0);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        <video
          ref={videoRef}
          src={url}
          muted={muted}
          loop
          onWaiting={() => setLoading(true)}
          onPlaying={() => setLoading(false)}
          style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
        />
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {/* Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            // borderRadius: 2
          }}
        >
          <Box>
            <IconButton onClick={togglePlay} color="inherit">
              {playing ? <Pause sx={{ color: '#fff' }} /> : <PlayArrow sx={{ color: '#fff' }} />}
            </IconButton>
            <IconButton onClick={toggleMute} color="inherit">
              {muted ? <VolumeOff sx={{ color: '#fff' }} /> : <VolumeUp sx={{ color: '#fff' }} />}
            </IconButton>
            <Slider
              value={volume}
              onChange={handleVolume}
              step={0.1}
              min={0}
              max={1}
              sx={{ width: 100, ml: 1, color: '#fff' }}
            />
          </Box>
          <Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Speed sx={{ color: '#fff' }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {[0.5, 1, 1.5, 2].map((speed) => (
                <MenuItem key={speed} onClick={() => changeSpeed(speed)}>
                  {speed}x
                </MenuItem>
              ))}
            </Menu>
            <IconButton onClick={handleFullscreen}>
              <ZoomOutMap sx={{ color: '#fff' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="body2" fontWeight={600}>{title}</Typography>
      </CardContent>
    </Card>
  );
};

export default CustomVideoPlayer;