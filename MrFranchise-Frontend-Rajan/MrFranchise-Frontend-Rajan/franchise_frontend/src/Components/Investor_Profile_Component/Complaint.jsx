import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

function Complaint() {
    const [selectedTopic, setSelectedTopic] = useState('');
  const [complaintText, setComplaintText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      topic: selectedTopic,
      complaint: complaintText,
    };

    console.log(formattedData);

    try {
      const response = await axios.post(
        "https://franchise-backend-wgp6.onrender.com/api/complaint/createComplaint",
        formattedData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("Complaint submitted:", response.data);
      alert("Complaint submitted successfully!");
      setSelectedTopic('');
      setComplaintText('');
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
     <Box sx={{ mt: 8, px: 2, marginLeft: -20, padding: 4 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: "auto", borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center", color: "#ffa000" }}>
          Submit a Complaint
        </Typography>

        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          onSubmit={handleSubmit}
        >
          <FormControl required fullWidth size="small">
            <InputLabel id="complaint-topic-label">Topic</InputLabel>
            <Select
              labelId="complaint-topic-label"
              id="complaint-topic"
              value={selectedTopic}
              label="Topic"
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <MenuItem value="Service Issue">Service Issue</MenuItem>
              <MenuItem value="Technical Bug">Technical Bug</MenuItem>
              <MenuItem value="Payment Problem">Payment Problem</MenuItem>
              <MenuItem value="Slow Response">Slow Response</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          {/* ✅ Bind the TextField to complaintText */}
          <TextField
            required
            label="Complaint"
            placeholder="Describe your issue"
            variant="outlined"
            multiline
            rows={5}
            fullWidth
            size="small"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
          />

          <Box sx={{ textAlign: "right" }}>
            <Button type="submit" variant="contained" color="primary" sx={{ backgroundColor: "#558b2f" }}>
              Submit Your Complaint
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Complaint;
