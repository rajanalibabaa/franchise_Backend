
import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Tabs, Tab} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import img from "../../assets/images/brandLogo.jpg"; 
import { useSelector } from 'react-redux';
import axios from 'axios';

const BrandDashBoard = ({ selectedSection, sectionContent }) => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const [brandData, setBrandData] = useState({});

    const brandUUID = useSelector((state) => state.auth.brandUUID);
    const token = useSelector((state) => state.auth.AccessToken);
     console.log('Brand UUID:', brandUUID);
     console.log('Token:', token);
    useEffect(() => {

        const fetchBrandDetails = async () => {
            try {
                const response = await axios.get(
                   `http://localhost:5000/api/v1/brand/register/getBrandByRegisterId/${brandUUID}`,
                   {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                   }

                );
                if(response.data.success) {
                    setBrandData( response.data.data);
                }else{
                    console.error("Error fetching brand details:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching brand details:", error);
            }
        };

        if (brandUUID && token) {
            fetchBrandDetails();
        }

    }, [brandUUID, token]);
    

    return (
        <div>
             <Typography variant="h6" fontWeight={600} mb={2} sx={{
                            textAlign: "center", color: "#fafafa",
                            backgroundColor: "#689f38", padding: "10px", borderRadius: "5px"
                        }}>
                Dashboard
            </Typography>
            <Box sx={{ display: "flex", minHeight: "85vh", bgcolor: "#f4f6f8" }}>
                {/* Main Content */}
                <Box sx={{ flex: 1, p: 3 }}>
                    {selectedSection ? (
                        sectionContent[selectedSection]
                    ) : (
                        <Box sx={{ display: "flex", gap: 4 }}>
                            {/* Profile Avatar */}
                            <Box sx={{
                                width: 240, height: 200, textAlign: "center",
                                bgcolor: "#fff", p: 2, borderRadius: 2, boxShadow: 2
                            }}>
                                 <Avatar sx={{
                                    width: 230, height: 210, mx: "auto", mb: 2,
                                    bgcolor: "transparent"
                                }}>
                                    <img
                                        src={img}
                                        alt="Profile"
                                        loading='lazy'
                                        style={{
                                            width: "90%", height: "110%",
                                            borderRadius: "40%", marginLeft: "30px", marginTop: "20px"
                                        }}
                                    />
                                    <PersonIcon fontSize="large" />
                                </Avatar>
                            </Box>

                            {/* Profile Info */}
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{
                                    mb: 3, bgcolor: "#fff", p: 2, borderRadius: 2,
                                    boxShadow: 2, width: "90%", textAlign: "center",
                                    height: "40%", paddingTop: "65px", paddingBottom: "65px"
                                }}>
                                    <Typography variant="h4" fontWeight={600}>
                                        Welcome {brandData.firstName}
                                    </Typography>
                                    <Typography color="text.secondary" variant="h5">
                                        Brand Investor
                                    </Typography>
                                    <Typography color="text.secondary" variant="h5" fontWeight={800}>
                                        ID(721720104305)
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}


                    {!selectedSection || selectedSection === "Dashboard" ? (
                        <>

                            <Box sx={{ display: "flex", gap: 4, mt: -6, padding: 2 }}>

                            </Box>


                            <Box sx={{ mt: 4 }}>
                                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                                </Box>
                                <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
                                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                                        <Tab label="Your Enqueries" />
                                        <Tab label="Total View" />
                                        <Tab label="Total Like" />
                                        <Tab label="Enqueries" />
                                    </Tabs>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        sectionContent[selectedSection]
                    )}

                </Box>
            </Box>
        </div>
    );
};

export default BrandDashBoard;











