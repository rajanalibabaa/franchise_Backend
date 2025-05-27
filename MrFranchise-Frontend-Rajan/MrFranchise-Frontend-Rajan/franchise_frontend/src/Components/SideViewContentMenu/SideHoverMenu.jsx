import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import { Box, Typography, Avatar,  } from "@mui/material";
import { categories } from "../../Pages/Registration/BrandLIstingRegister/BrandCategories";

const SideViewContent = ({ hoverCategory, onHoverLeave }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  return (
    <Drawer anchor="top" open={hoverCategory !== null} onClose={onHoverLeave} PaperProps={{ sx: { height: 450 } }}>
      <Box onMouseLeave={onHoverLeave} sx={{ display: "flex", flexDirection: "row", height: "100%",  overflow: "hidden", }} >
        <Box sx={{ width: 220, borderRight: "1px solid #eee", overflowY: "auto", px: 2, py: 1, }} >
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Top categories
          </Typography>
          {categories.map((category, index) => (
            <Box key={index} onMouseEnter={() => {
                setActiveCategory(index);
                setActiveSubCategory(null);
              }}
              sx={{ cursor: "pointer", py: 1, color: activeCategory === index ? "#1976d2" : "inherit", fontWeight: activeCategory === index ? "bold" : "normal", }} >
              {category.name}
            </Box>
          ))}
        </Box>
        {activeCategory !== null && (
          <Box sx={{ width: 300, borderRight: "1px solid #eee", overflowY: "auto", px: 2, py: 1, }} >
            <Typography variant="subtitle1" fontWeight="bold" mb={1} display="flex" alignItems="center" >
              {categories[activeCategory].name}
            </Typography>
            {categories[activeCategory].children?.map((subCategory, idx) => (
              <Box key={idx} onMouseEnter={() => setActiveSubCategory(subCategory)}
                sx={{ cursor: "pointer", display: "flex", alignItems: "center", py: 1, gap: 1, }} >
                {subCategory.icon && (
                  <Box component={subCategory.icon} sx={{ fontSize: 20 }} />
                )}
                <Typography>{subCategory.name}</Typography>
              </Box>
            ))}
          </Box>
        )}
        {activeSubCategory && (
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 2, }} >
            <Typography variant="subtitle1" fontWeight="bold" gridColumn="1/-1" mb={1} >
              {activeSubCategory.name}
            </Typography>
            {activeSubCategory.children?.map((subChild, idx) => {
              const name = typeof subChild === "string" ? subChild : subChild.name;
              const image = typeof subChild === "object" && subChild.image;

              return (
                <Box key={idx} sx={{ textAlign: "center", cursor: "pointer" }} >
                  <Avatar src={image} alt={name} sx={{ width: 60, height: 60, margin: "0 auto", border: "1px solid #eee", }} />
                  <Typography variant="body2" mt={1}>
                    {name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default SideViewContent;