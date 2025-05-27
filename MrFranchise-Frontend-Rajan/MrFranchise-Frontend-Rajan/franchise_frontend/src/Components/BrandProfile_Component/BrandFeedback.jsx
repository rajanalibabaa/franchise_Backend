import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Rating,
    Paper,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';

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

const BrandFeedBack = () => {
    const [value, setValue] = useState(2);
    const [hover, setHover] = useState(-1);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [feedbackText, setFeedbackText] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!feedbackText.trim()) {
            console.error("Feedback cannot be empty");
            return;
        }

        const formattedData = {
            topic: selectedTopic,
            rating: value,
            feedback: feedbackText,
        };

        try {
            const response = await axios.post(
                "https://franchise-backend-wgp6.onrender.com/api/feedback/createFeedback",
                formattedData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Feedback submitted:", response.data);
            alert("Feedback submitted successfully!");
            setFeedbackText('');
            setSelectedTopic('');
            setValue(2);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Error submitting feedback");
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, px: 2, marginLeft: -20 }}>
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    maxWidth: 700,
                    width: "100%",
                    borderRadius: 4,
                    backgroundColor: "#ffffff",
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center", color: "#ffa000" }}>
                    Submit Your Feedback
                </Typography>

                {/* Rating Component */}
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

                {/* Feedback Form */}
                <Box
                    component="form"
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    onSubmit={handleSubmit}
                >
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

                    {/* Feedback Field */}
                    <TextField
                        required
                        label="Feedback"
                        placeholder="Share your thoughts..."
                        variant="outlined"
                        multiline
                        rows={5}
                        fullWidth
                        size="medium"
                        value={feedbackText} // ✅ bind value
                        onChange={(e) => setFeedbackText(e.target.value)} // ✅ bind onChange
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

export default BrandFeedBack;
