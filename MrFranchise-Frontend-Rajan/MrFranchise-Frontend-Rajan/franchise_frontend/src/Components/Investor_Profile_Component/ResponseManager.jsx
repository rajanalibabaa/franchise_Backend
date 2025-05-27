import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Rating,
} from "@mui/material";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const labels = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const FeedBack = () => {
  const [value, setValue] = useState(2);
  const [hover, setHover] = useState(-1);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      topic: selectedTopic,
      rating: value,
      feedback: feedbackText,
    };

    try {
      const response = await axios.post(
        "https://franchise-backend-wgp6.onrender.com/api/feedback/createFeedback",
        formattedData,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Feedback submitted:", response.data);
      setFeedbackText('');
      setSelectedTopic('');
      setValue(2);
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error("Submission error:", error);
      alert('Failed to submit feedback.');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: "auto", borderRadius: 3, backgroundColor: "#ffffff" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center", color: "#ffa000" }}>
          Submit Your Feedback
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Rating
            name="hover-feedback"
            value={value}
            precision={0.5}
            getLabelText={getLabelText}
            onChange={(event, newValue) => setValue(newValue)}
            onChangeActive={(event, newHover) => setHover(newHover)}
            size="large"
            emptyIcon={<StarIcon style={{ opacity: 0.4 }} fontSize="inherit" />}
          />
          <Box sx={{ ml: 2, minWidth: 80, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {labels[hover !== -1 ? hover : value]}
            </Typography>
          </Box>
        </Box>

        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }} onSubmit={handleSubmit}>
          <FormControl required fullWidth size="medium">
            <InputLabel id="topic-label">Topic</InputLabel>
            <Select
              labelId="topic-label"
              id="topic-select"
              value={selectedTopic}
              label="Topic"
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <MenuItem value="Service Quality">Service Quality</MenuItem>
              <MenuItem value="Support Team">Support Team</MenuItem>
              <MenuItem value="Platform UI">Platform UI</MenuItem>
              <MenuItem value="Response Time">Response Time</MenuItem>
              <MenuItem value="Pricing">Pricing</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            required
            label="Feedback"
            placeholder="Share your thoughts..."
            variant="outlined"
            multiline
            rows={5}
            fullWidth
            size="medium"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ alignSelf: "flex-end", borderRadius: 2, px: 4, backgroundColor: "#558b2f" }}
          >
            Submit Your Feedback
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

const ComplaintContent = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [complaintText, setComplaintText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      topic: selectedTopic,
      complaint: complaintText,
    };

    try {
      const response = await axios.post(
        "https://franchise-backend-wgp6.onrender.com/api/complaint/createComplaint",
        formattedData,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Complaint submitted:", response.data);
      alert("Complaint submitted successfully!");
      setSelectedTopic('');
      setComplaintText('');
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit complaint.");
    }
  };

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: "auto", borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center", color: "#ffa000" }}>
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
};

const ContactUs = () => {
  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: "auto", borderRadius: 3 }}>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
  You can reach us by email at{' '}
 
  <a
    href="https://mail.google.com/mail/?view=cm&fs=1&to=mrfranchisc22@gmail.com"
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#1976d2", textDecoration: "underline" }}
  >
    mrfranchisc22@gmail.com
  </a>
</Typography>

      </Paper>
    </Box>
  );
};

const data = {
  Category: ["Contact Us", "Feedback", "Complaint"],
};

const ResponseManager = () => {
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleToggle = (category) => {
    setOpenCategory(prev => (prev === category ? null : category));
    setSelectedItem(null);
  };

  const renderContent = (item) => {
    if (item === "Feedback") return <FeedBack />;
    if (item === "Complaint") return <ComplaintContent />;
    if (item === "Contact Us") return <ContactUs />;
    return null;
  };

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight={600}
        mb={2}
        sx={{
          textAlign: "center",
          color: "#fafafa",
          backgroundColor: "#689f38",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        Response Manager
      </Typography>

      <Box
        sx={{
          display: 'flex',
          border: '1px solid #ddd',
          borderRadius: 2,
          maxHeight: 600,
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <Box sx={{ width: 250, borderRight: '1px solid #ccc', overflowY: 'auto' }}>
          <List disablePadding>
            <ListItemButton onClick={() => handleToggle("Category")}>
              <ListItemText primary="Category" />
              {openCategory === "Category" ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openCategory === "Category"} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {data.Category.map((item, index) => (
                  <ListItemButton
                    key={index}
                    sx={{ pl: 4 }}
                    selected={selectedItem === item}
                    onClick={() => setSelectedItem(item)}
                  >
                    <ListItemText primary={item} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </List>
        </Box>

        {/* Right Side Content */}
        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
          {selectedItem ? renderContent(selectedItem) : (
            <Typography sx={{ textAlign: 'center', mt: 1,backgroundColor:"#e2faa7",color:"#f29724" }} color="text.secondary">
              Select a category to view its content.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};


export default ResponseManager;
