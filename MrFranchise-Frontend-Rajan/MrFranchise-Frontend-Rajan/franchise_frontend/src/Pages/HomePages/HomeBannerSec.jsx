import React, { useState,useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import bgimg from "../.././assets/Images/bgimg.jpg";
import logo from "../.././assets/Images/logo.png";
import {
  Box,
  Button,
  Typography,
  Modal,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import TopBrandVdoSec from "../../Components/HomePage_VideoSection/TopBrandVdoSec";
import TopIndusVdoSec from "../../Components/HomePage_VideoSection/TopIndusVdoSec";
import TopInvestVdoSec from "../../Components/HomePage_VideoSection/TopInvestVdoSec";
import Navbar from "../../Components/Navbar/NavBar";
import Footer from "../../Components/Footers/Footer";
import LoginRegisterPopUp from "../../Components/PopUpModal/LoginRegisterPopUp";
import PopupModal from "../../Components/PopUpModal/PopUpModal";
import TopBrandVdoCards from "../../Components/HomePage_VideoSection/TopBrandVdoCards";
import TopInvestVdo2 from "../../Components/HomePage_VideoSection/TopInvestVdo2";
import TopInvestVdo3 from "../../Components/HomePage_VideoSection/TopInvestVdo3";


const HomeBannerSec = () => {
    const [industry, setIndustry] = useState("");
    const [sector, setSector] = useState("");
    const [service, setService] = useState("");
    const [open, setOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false); 

    // const navigate = useNavigate();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handlePopupClose = () => setIsPopupOpen(false);
   

    useEffect(() => {
      const navEntries = performance.getEntriesByType("navigation");
      const isReload = navEntries[0]?.type === "reload";
      const popupShown = sessionStorage.getItem("popup-shown");
  
      if (!popupShown || isReload) {
        setIsPopupOpen(true);
        sessionStorage.setItem("popup-shown", "true");
      }
    }, []);

{/* <PopupModal open={isPopupOpen} onClose={handlePopupClose} /> */}

  return (
    <>
 <PopupModal open={isPopupOpen} onClose={handlePopupClose} />

    {/* login and register pop up */}
    <LoginRegisterPopUp/>
    {/* navbarcontent */}
    <Navbar />
    
    <Box
      sx={{
      
        minHeight: 150,
        maxWidth:1200,
        justifyContent:"center",
        backgroundImage: `url(${"bgimg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: "center",
        color: "white",
        px: 4,
        py: 5,
        mx:"auto",
        position: "relative",
      }}
    
    >
      <Box
      sx={{display:"flex",
        
        justifyContent: "space-between",
        alignItems: "left",
        backgroundColor: "#ffff",
        padding: 2,
        borderRadius: 1,
        boxShadow: 1,
      }}>
        
        <img style={{width:300,}} src={logo} alt="logo" />
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography variant="h4" sx={{ mb: 1, color: "black" }}>
         Welcome to <Box component="span" sx={{ color: "yellow", fontWeight: "bold" }}>Our Franchise</Box> Website
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "black" }}>
          World's highest visited franchise website network
        </Typography>
   

        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 3,
            mb: 4,
          }}
        >
          <Button variant="contained" sx={{ bgcolor: "#b00", '&:hover': { bgcolor: "darkred" } }}>Franchise</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#b00", '&:hover': { bgcolor: "darkred" } }}
            onClick={() => navigate("/dealer")}
          >
            Dealer Distributer
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#b00", '&:hover': { bgcolor: "darkred" } }}
            onClick={() => navigate("/partner")}
          >
           Channel Partner
          </Button>
        </Box> */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel sx={{ color: "black" }}>Industry</InputLabel>
            <Select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              label="Industry"
              sx={{ color: "white", borderColor: "white" }}
            >
              <MenuItem value="">Select Industry</MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 220, }}>
            <InputLabel sx={{ color: "black" }}>Sector</InputLabel>
            <Select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              label="Sector"
              sx={{ color: "white" }}
            >
              <MenuItem value="">Select Sector</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Education">Education</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel sx={{ color: "black" }}>Service/Product</InputLabel>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value)}
              label="Service/Product"
              sx={{ color: "white" }}
            >
              <MenuItem value="">Select Service/Product</MenuItem>
              <MenuItem value="Consulting">Consulting</MenuItem>
              <MenuItem value="Software">Software</MenuItem>
            </Select>
          </FormControl>
          {/* Search Button */}
  <Button
    variant="contained"
    sx={{
      bgcolor: "#f29724",
      color: "#000",
      px: 4,
      height: "45px",
      mt: 1,
      textTransform: "none",
    }}
    onClick={() => {
      // Add your search logic here
      console.log({ industry, sector, service });
    }}
  >
    Search
  </Button>
        </Box>
      </Box>
      </Box>

      

      <Box
        className="ask-experts"
        sx={{
          position: "fixed",
          top: "60%",
          left: "94%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
        }}
      >
        <Tooltip title="Ask Our Experts" arrow placement="left">
          <Button onClick={handleOpen} sx={{ borderRadius: "50%", p: 0 }}>
            <img
              src={"bgimg"}
              loading="lazy"
              alt="bot"
              style={{ width: 70, height: 80, borderRadius: "50%" }}
            />
          </Button>
        </Tooltip>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Why Should We Ask?
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic,
            quibusdam. Inventore quam, commodi quo perspiciatis ut voluptatem
            corporis, laudantium ullam eaque voluptates aliquid totam temporibus
            iste molestiae deserunt quod ipsam.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
     
    </Box>
    {/* top single vido section */}
     <TopBrandVdoSec/>
     <TopBrandVdoCards/>
     {/* top double video section */}
     <TopIndusVdoSec/>
     {/* top triple video section */}
     <TopInvestVdoSec/>
     
     <TopInvestVdo2/>
     <TopInvestVdo3/>
{/* footer sections */}
     <Footer/>
     </>
    
  )
}

export default HomeBannerSec











