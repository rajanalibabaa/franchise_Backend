import React, { useRef, useState } from "react";
import {  Box,  Button,  Card,  Container,  IconButton, Modal, TextField,  Typography,styled, keyframes} from "@mui/material";
import { motion } from "framer-motion";
// import Footer from "../../Components/Footer";

const media = [
  { type: "video", src: 'people' },
  { type: "image", src: 'zudio' },
  { type: "image", src: 'zudio' },
  { type: "image", src: 'zudio' },
];

// Keyframe animations
const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// const fadeIn = keyframes`
//   from { opacity: 0; }
//   to { opacity: 1; }
// `;

const scaleUp = keyframes`
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Styled components
const AnimatedContainer = styled(motion.div)({
  fontFamily: "'Inter', sans-serif",
  padding: '40px',
  background: 'linear-gradient(to bottom, #f2f6fc, #ffffff)',
  color: '#1a1a1a',
});

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  background: '#fff',
  padding: '25px 30px',
  borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
  marginBottom: '40px',
  animation: `${fadeInDown} 1s ease forwards`,
});

const BrandLogo = styled('img')({
  height: '65px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },

});

const TabButton = styled(Button)(({ active }) => ({
  background: active ? '#0057ff' : '#eef2f7',
  color: active ? 'white' : 'inherit',
  padding: '10px 18px',
  borderRadius: '10px',
  fontWeight: 500,
  textTransform: 'uppercase',
  '&:hover': {
    backgroundColor: '#0057ff',
    color: 'white',
  },
}));

const ContactModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(Box)({
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
  width: '90%',
  maxWidth: '400px',
  position: 'relative',
  animation: `${scaleUp} 0.3s ease`,
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '10px',
  right: '14px',
});

const MainContent = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '40px',
  animation: `${fadeInUp} 1s ease forwards`,
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
});

const LeftContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  marginBottom: '20px',
});

const MediaSlider = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
  position: 'relative',
  gap: '1rem',
});

const MediaContainer = styled(Box)({
  flex: 1,
  maxWidth: '700px',
  position: 'relative',
});

const MediaItem = styled('img')({
  width: '100%',
  maxHeight: '400px',
  borderRadius: '10px',
  objectFit: 'cover',
});

const VideoItem = styled('video')({
  width: '100%',
  maxHeight: '400px',
  borderRadius: '10px',
  objectFit: 'cover',
});

const ArrowButton = styled(IconButton)({
  fontSize: '2rem',
  background: 'rgba(255,255,255,0.8)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  '&:hover': {
    background: '#007bff',
    color: 'white',
  },
});

const ThumbnailGallery = styled(Box)({
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
  flexWrap: 'wrap',
});

const Thumbnail = styled(Box)(({ active }) => ({
  width: '80px',
  height: '60px',
  overflow: 'hidden',
  cursor: 'pointer',
  border: active ? '2px solid #007bff' : '2px solid transparent',
  borderRadius: '6px',
}));

const ThumbItem = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const QuickStats = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
  background: '#ffffff',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 5px 10px rgba(0,0,0,0.05)',
});

const ContentSection = styled(Box)({
  background: '#fff',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
  animation: `${fadeInUp} 1s ease forwards`,
});

const InfoGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px 30px',
  fontSize: '14px',
  '& div span': {
    fontWeight: '600',
  },
});

const ExpansionList = styled(Box)({
  '& div': {
    marginBottom: '10px',
  },
});

const RightContent = styled(Box)({
  background: '#ffffff',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)',
  position: 'sticky',
  top: '30px',
  height: 'fit-content',
  animation: `${fadeInRight} 1s ease forwards`,
  marginBottom: '20px',
});

const FormInput = styled(TextField)({
  width: '100%',
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
});

const SubmitButton = styled(Button)({
  width: '100%',
  backgroundColor: '#1e3a8a',
  color: '#fff',
  padding: '14px',
  fontWeight: '600',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#0f2a6e',
  },
});
function BrandViewPage() {
    const [activeTab, setActiveTab] = useState("business");
    const [showModal, setShowModal] = useState(false);
    const [mediaIndex, setMediaIndex] = useState(0);
    
    const sectionRefs = {
      business: useRef(null),
      investment: useRef(null),
      property: useRef(null),
      training: useRef(null),
      agreement: useRef(null),
    };
  
    const videoRef = useRef(null);
  
    const scrollToSection = (ref) => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    };
  
    const toggleModal = () => setShowModal(!showModal);
  
    const handleNext = () => {
      if (media[mediaIndex].type === "video") videoRef.current?.pause();
      setMediaIndex((prev) => (prev + 1) % media.length);
    };
  
    const handlePrev = () => {
      if (media[mediaIndex].type === "video") videoRef.current?.pause();
      setMediaIndex((prev) => (prev - 1 + media.length) % media.length);
    };
  
  return (
    <AnimatedContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.2 }}
  >
    {/* HEADER */}
    <Header>
      <BrandLogo src={'zudio'} alt="Brand Logo" />
      
      <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {Object.keys(sectionRefs).map((key) => (
          <TabButton
            key={key}
            active={activeTab === key}
            onClick={() => {
              setActiveTab(key);
              scrollToSection(sectionRefs[key]);
            }}
          >
            {key}
          </TabButton>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', gap: '14px' }}>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#1e3a8a',
            '&:hover': { backgroundColor: '#153179' },
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: '600',
          }}
          onClick={toggleModal}
        >
          View Contact
        </Button>
      </Box>
    </Header>

    {/* CONTACT MODAL */}
    <ContactModal
      open={showModal}
      onClose={toggleModal}
    >
      <ModalContent>
        <CloseButton onClick={toggleModal}>×</CloseButton>
        <Typography variant="h6" sx={{ mb: 2 }}>Contact Details</Typography>
        <Typography>
          <strong>Name:</strong> Fiery Pot Foods Team
        </Typography>
        <Typography>
          <strong>Phone:</strong> +91 98765 43210
        </Typography>
        <Typography>
          <strong>Email:</strong> contact@fierypotfoods.com
        </Typography>
      </ModalContent>
    </ContactModal>

    {/* MAIN CONTENT */}
    <Container maxWidth="xl">
      <MainContent>
        {/* LEFT CONTENT */}
        <LeftContent>
          <MediaSlider>
            <ArrowButton onClick={handlePrev}>&lt;</ArrowButton>
            
            <MediaContainer>
              {media[mediaIndex].type === "video" ? (
                <VideoItem
                  ref={videoRef}
                  src={media[mediaIndex].src}
                  controls
                />
              ) : (
                <MediaItem
                  src={media[mediaIndex].src}
                  alt="media"
                />
              )}
            </MediaContainer>
            
            <ArrowButton onClick={handleNext}>&gt;</ArrowButton>
          </MediaSlider>

          {/* Thumbnail Gallery */}
          <ThumbnailGallery>
            {media.map((item, index) => (
              <Thumbnail 
                key={index} 
                active={index === mediaIndex}
                onClick={() => {
                  if (media[mediaIndex].type === "video") videoRef.current?.pause();
                  setMediaIndex(index);
                }}
              >
                {item.type === "video" ? (
                  <VideoItem src={item.src} muted />
                ) : (
                  <ThumbItem
                    src={item.src}
                    alt={`thumb-${index}`}
                  />
                )}
              </Thumbnail>
            ))}
          </ThumbnailGallery>

          {/* Quick Stats */}
          <QuickStats>
            <Typography><strong>Investment:</strong> ₹10 - ₹20 Lakhs</Typography>
            <Typography><strong>Area:</strong> 200 - 600 Sq.ft</Typography>
            <Typography><strong>Outlets:</strong> 10-20</Typography>
            <Typography><strong>Est. Year:</strong> 2021</Typography>
          </QuickStats>

          {/* Sections */}
          <ContentSection ref={sectionRefs.business}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a' }}>
              Brand Details 
            </Typography>
            <Typography>
              Fiery Pot Foods is a fast-growing QSR chain serving fusion foods
              like momos, kebabs, and rolls. Known for high ROI and strong
              branding.
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a', mt: 2 }}>
              Company Name
            </Typography>
            <Typography>
              Fiery Pot Foods is a fast-growing QSR chain serving fusion foods
              like momos, kebabs, and rolls. Known for high ROI and strong
              branding.
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a', mt: 2  }}>
              Description 
            </Typography>
            <Typography>
              Fiery Pot Foods is a fast-growing QSR chain serving fusion foods
              like momos, kebabs, and rolls. Known for high ROI and strong
              branding.
            </Typography>
          </ContentSection>

          <ContentSection ref={sectionRefs.investment}>
          <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a' }}>
              Investment Details 
            </Typography>
            <Typography>
              Fiery Pot Foods is a fast-growing QSR chain serving fusion foods
              like momos, kebabs, and rolls. Known for high ROI and strong
              branding.
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a', mt: 2 }}>
              Franchise Investment
            </Typography>
            <InfoGrid>
              <Typography>Operations Started: <span>2021</span></Typography>
              <Typography>Franchise Since: <span>2022</span></Typography>
              <Typography>Franchise Fee: <span>₹2.5 Lakhs</span></Typography>
              <Typography>Franchise Fee: <span>₹2.5 Lakhs</span></Typography>
            </InfoGrid>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a', mt: 2 }}>
              Outlet Distribution
            </Typography>
            <InfoGrid>
              <Typography>Operations Started: <span>2021</span></Typography>
              <Typography>Franchise Since: <span>2022</span></Typography>
              <Typography>Franchise Fee: <span>₹2.5 Lakhs</span></Typography>
              <Typography>Franchise Fee: <span>₹2.5 Lakhs</span></Typography>
            </InfoGrid>
          </ContentSection>

          <ContentSection ref={sectionRefs.property}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a' }}>
              Property Details
            </Typography>
            <InfoGrid>
              <Typography>Area Required: <span>200 - 600 Sq.ft</span></Typography>
              <Typography>Location: <span>High footfall areas</span></Typography>
            </InfoGrid>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a', mt: 2 }}>
              Select Location
            </Typography>
            <InfoGrid>
            <Typography>Location: <span>High footfall areas</span></Typography>
            <Typography>Location: <span>High footfall areas</span></Typography>
            </InfoGrid>
          </ContentSection>

          <ContentSection ref={sectionRefs.training}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a' }}>
              Training & Support
            </Typography>
            <InfoGrid>
              <Typography>Training: <span>Onsite & Online</span></Typography>
              <Typography>Manuals Provided: <span>Yes</span></Typography>
            </InfoGrid>
          </ContentSection>

          <ContentSection ref={sectionRefs.agreement}>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a' }}>
              Agreement Terms
            </Typography>
            <InfoGrid>
              <Typography>Tenure: <span>5 Years</span></Typography>
              <Typography>Renewable: <span>Yes</span></Typography>
            </InfoGrid>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a', mt: 2 }}>
            Agreement Clause
            </Typography>
            <Typography>
            Both parties hereby agree to the terms and conditions outlined in this agreement. This document represents the entire understanding between the parties and supersedes all prior discussions or communications, whether written or verbal. Any amendments or modifications must be made in writing and signed by both parties to be considered valid. Each party acknowledges that they have read, understood, and voluntarily entered into this agreement.
            </Typography>
          </ContentSection>

          <ContentSection>
            <Typography variant="h5" sx={{ mb: 2, color: '#1e3a8a' }}>
              Expansion Plans
            </Typography>
            <ExpansionList>
              <Typography><strong>North:</strong> Delhi, Haryana, Punjab</Typography>
              <Typography><strong>South:</strong> Tamil Nadu, Karnataka</Typography>
              <Typography><strong>East:</strong> Odisha, West Bengal</Typography>
              <Typography><strong>West:</strong> Maharashtra, Gujarat</Typography>
              <Typography><strong>Central:</strong> MP, Chhattisgarh</Typography>
              <Typography><strong>UTs:</strong> All major UTs</Typography>
            </ExpansionList>
          </ContentSection>
        </LeftContent>

        {/* RIGHT CONTENT - Insta Apply */}
        <RightContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" sx={{ color: '#1e3a8a', mb: 2 }}>
              Insta Apply
            </Typography>
            
            <FormInput label="Your Name" variant="outlined" required />
            <FormInput label="Email Address" variant="outlined" type="email" required />
            <FormInput label="Mobile Number" variant="outlined" required />
            
            <FormInput 
              select
              label="Select State"
              variant="outlined"
              required
              SelectProps={{ native: true }}
            >
              <option value=""></option>
            </FormInput>
            
            <FormInput 
              select
              label="Select City"
              variant="outlined"
              required
              SelectProps={{ native: true }}
            >
              <option value=""></option>
            </FormInput>
            
            <FormInput label="Pincode" variant="outlined" />
            <FormInput 
              label="Full Address" 
              variant="outlined" 
              multiline 
              rows={4} 
            />
            
            <SubmitButton type="submit" variant="contained">
              Submit
            </SubmitButton>
          </Box>
        </RightContent>
      </MainContent>
    </Container>

    {/* <Footer /> */}
  </AnimatedContainer>
  )
}

export default BrandViewPage
































