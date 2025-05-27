import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const BrandAddVedios = () => {
  const [videoFiles, setVideoFiles] = useState([null]); 

  const handleFileChange = (index, file) => {
    const updated = [...videoFiles];
    updated[index] = file;
    setVideoFiles(updated);
  };

  const handleAddField = () => {
    setVideoFiles([...videoFiles, null]);
  };

  const handleRemoveField = (index) => {
    const updated = videoFiles.filter((_, i) => i !== index);
    setVideoFiles(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Selected video files:', videoFiles);
    
  };

  return (
    <Box>
     <Typography variant="h6" fontWeight={600} mb={2} sx={{
                                textAlign: "center", color: "#fafafa",
                                backgroundColor: "#689f38", padding: "10px", borderRadius: "5px"
                            }}>
        ADD VIDEOS
      </Typography>
    <Box sx={{ p: 3, textAlign: "center", marginTop: 20}}>
      
      <form onSubmit={handleSubmit}>
        {videoFiles.map((file, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(index, e.target.files[0])}
              required
              style={{
                backgroundColor: '#f0f0f0',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #ccc',
                cursor: 'pointer',
                color: '#333',
                fontWeight: '100',
                width: '100%',
                maxWidth: '400px',
                
              }}
            />

            {file && (
              <Box
                component="video"
                src={URL.createObjectURL(file)}
                controls
                sx={{ width: '100%', height: 'auto', mt: 1, borderRadius: 2, boxShadow: 2 }}
              />
            )}
            {videoFiles.length > 1 && (
              <Button onClick={() => handleRemoveField(index)} color="error" sx={{ mt: 1 }}>
                Remove
              </Button>
            )}
          </Box>
        ))}
        <Button onClick={handleAddField}  sx={{ mr: 2,backgroundColor:"#ffa000",color:"#fff3e0" }}>
          Add More Video
        </Button>
        <Button type="submit" variant="contained" sx={{backgroundColor:"#558b2f"}}>
          Submit
        </Button>
      </form>
    </Box>
    </Box>
  );
};

export default BrandAddVedios;
