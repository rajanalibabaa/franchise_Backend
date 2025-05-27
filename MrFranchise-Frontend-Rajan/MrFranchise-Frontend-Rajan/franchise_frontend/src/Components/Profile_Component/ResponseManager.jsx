import React from 'react'
import { Box, Typography, Avatar, Link } from "@mui/material";
import img from "../../assets/images/brandLogo.jpg"; // Adjust the path as necessaryv


const ResponseManager = () => {
  return (
    <div>
    {/* <Box>
   <ProfilePage />
   </Box> */}
   <Box sx={{ p: 4, backgroundColor: "#f5f5f5", borderRadius: 3, maxWidth: 1100, mx: "auto", boxShadow: 3,marginTop: 10,marginLeft: 3 }}>
   <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, textAlign: "center" }}>
     RESPONSE MANAGER
     
   </Typography>

   <Box
     sx={{
       display: "flex",
       flexDirection: { xs: "column", md: "row" },
       gap: 3,
       alignItems: "center",
       backgroundColor: "#fff",
       borderRadius: 2,
       border: "1px solid #ddd",
       p: 3,
     }}
   >
     <Box sx={{ flex: 1, textAlign: "left", flexGrow: 1,paddingRight: 20 }}>
       <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
         Account Manager
       </Typography>
       <Typography><strong>Name:</strong> John Doe</Typography>
       <Typography>
         <strong>Mobile:</strong>{" "}
         <Link href="tel:+917667857887" underline="hover">
           +91 7667857887
         </Link>
       </Typography>
       <Typography>
         <strong>Email:</strong>{" "}
         <Link href="mailto:arul03sekar@gmail.com.net" underline="hover">
           arul03sekar@gmail.com.net
         </Link>
       </Typography>
       <Typography><strong>Role:</strong> Investor</Typography>
       <Box
         sx={{
           mt: 2,
           p: 2,
           backgroundColor: "#f0f0f0",
           borderRadius: 2,
           border: "1px solid #ccc",
         }}
       >
         <Typography variant="body2" sx={{ width: "100%" }}>
           <strong>Description:</strong> Lorem ipsum, dolor sit amet consectetur adipisicing elit. 
           In nesciunt eaque libero delectus? Pariatur assumenda sit laborum nesciunt sint,
           tempore cupiditate modi ducimus provident quis eos praesentium nihil dicta deserunt.
         </Typography>
       </Box>
     </Box>

     <Box sx={{ flexShrink: 0 }}>
       <Avatar
         alt="Manager Logo"
         src={img}
         sx={{ width: 120, height: 120, borderRadius: 2 }}
         variant="rounded"
       />
     </Box>
   </Box>
 </Box>
 </div>
  )
}

export default ResponseManager
