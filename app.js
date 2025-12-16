import express from "express";
import thirdPartyAuthRouter from "./src/Routes/ThirdpartyRoutes/thirdpartyAuthenticationRouters.js";

import feedbackRoutes from "./src/Routes/FeedbackRoutes/feedbackRoutes.js";
import complaintRoutes from "./src/Routes/ComplaintRoutes/complaintRoutes.js";
import adminRoutess from "./src/Routes/AdminRoutes/adminsRoutes.js";
import postRequireRoutes from "./src/Routes/PostRequirementRoutes/postRequirementRoutes.js";
import { AdminDashBoardClientRouter } from "./src/Routes/AdminRoutes/AdminDashBoardClientRouter.js";
import { InvestorRouter } from "./src/Routes/InvestorRoutes/invRegisterRoutes.js";
import { fbPostsRouter } from "./src/Routes/AdminRoutes/SocialMediaRoutes/fbPostsRoutes.js";
import { videoAdvertiseRoute } from "./src/Routes/AdminRoutes/AdminVideoAdvertiseRoutes.js";

import { frontendHomePageBrandsRouter } from "./src/Routes/FeatureRoutes/FrontendhomePageRoutes/frontendHomePageBrandsRoutes.js";

import { Login } from "./src/Routes/Login/LoginRoutes.js";
import { logoutRouter } from "./src/Routes/Logout/logoutRoute.js";
import sendOtpRouter from "./src/Routes/otpSenderRouter/sendOtp.js";
import brandListingRoutes from "./src/Routes/BrandRoutes/brandListingRoutes.js";
import { sendOTPVerifyOTPRoutes } from "./src/Routes/otpSenderRouter/sendOTPVerifyOTPRoutes.js";
import { likeRouter } from "./src/Routes/LikeRouter/LikeRouter.js";
import { ViewedBrandsRouter } from "./src/Routes/ViewedBrandsRoutes/ViewedBrandsRoutes.js";
import { filterRouter } from "./src/Routes/FilterRoute/FilterRoutes.js";
import { InstantApplyRouter } from "./src/Routes/BrandRoutes/instantApplyRoutes.js";
import { subscribeRouter } from "./src/Routes/SubcribeRoutes/subscribeRoutes.js";
import { OtherIndustriesRouter } from "./src/Routes/OtherIndustriesRoutes/OtherIndustriesRoutes.js";
import { shortListRouter } from "./src/Routes/ShortListRouter/shortListRoutes.js";
import { newIncomingBrandRouter } from "./src/Routes/AdminRoutes/AdminBrandAccessRoutes/newIncomingBrandRoutes.js";
import { overAllPlatformRoutes } from "./src/Routes/BrandRoutes/overAllPlatformRoutes.js";
import { superAdminRouter } from "./src/Routes/AdminRoutes/superAdminRoutes/superAdminRoutes.js";
import socailPost from "./src/utils/socialmediapost/SocialRouter.js"
import { userRouter } from "./src/Routes/AdminRoutes/userRoutes/userRoutes.js";
import { mahalRouter } from "./src/Routes/Mahal/mahal.router.js";
import { brandpauseplayRouter } from "./src/Routes/AdminRoutes/AdminBrandAccessRoutes/brandpauseplayRouter.js";
import ManualLeadRouter from "./src/Routes/Lead/ManualLeadApplyRoutes/ManualLeadRoutes.js";
import { paymentRouter } from "./src/Routes/AdminRoutes/AdminBrandAccessRoutes/paymentRouter.js";
import leadPackageRouter from "./src/Routes/LeadPackage/LeadPackage.js";
import { brandleadsRouter } from "./src/Routes/Lead/brandLeadsRouter.js";
import { industryManagementRouter } from "./src/Routes/AdminRoutes/CMS/industryManagement.routes.js";
import { searchRoutes } from "./src/Routes/search/searchRoutes.js";

const router = express.Router();

router.use(thirdPartyAuthRouter);
router.use(Login);

router.use(postRequireRoutes);

router.use(feedbackRoutes);
router.use(complaintRoutes);
router.use(InvestorRouter);
router.use(brandListingRoutes);
router.use(filterRouter);
router.use(overAllPlatformRoutes)

// admin
router.use(adminRoutess);
router.use(AdminDashBoardClientRouter);

// video advertise
router.use(videoAdvertiseRoute);



//logout routers
router.use(logoutRouter);

router.use(fbPostsRouter);



router.use(sendOtpRouter);



router.use(frontendHomePageBrandsRouter);

// send otp verify otp royutes
router.use(sendOTPVerifyOTPRoutes);

router.use(likeRouter);

//view brands
router.use(ViewedBrandsRouter);

//Filter
router.use(filterRouter);

// InstantApplyRouter
router.use(InstantApplyRouter);

// subscribe routes
router.use(subscribeRouter);
// OtherIndustries
router.use(OtherIndustriesRouter);

// superAdminRouter

router.use(superAdminRouter)

router.use(ManualLeadRouter)

router.use(brandleadsRouter);

router.use(leadPackageRouter);

//shortListRouter
router.use(shortListRouter);


//Admin New Incoming Brands Routes

router.use(newIncomingBrandRouter)
router.use(userRouter)


router.use(socailPost)


//Mahal project
router.use(mahalRouter)

//brandpauseplayRouter
router.use(brandpauseplayRouter)

//paymentRouter
router.use(paymentRouter)


//industryManagementRouter
router.use(industryManagementRouter)


//searchRoutes
router.use(searchRoutes)



function getRoutes(router, basePath = "") {
  const routes = [];
  router.stack.forEach((layer) => {
    // Direct route (GET, POST, etc.)
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).map((m) =>
        m.toUpperCase()
      );
      routes.push({
        method: methods.join(", "),
        path: basePath + layer.route.path,
      });
    }
    // Nested router
    else if (layer.name === "router" && layer.handle && layer.handle.stack) {
      let path = "";
      if (layer.regexp && layer.regexp.source) {
        const match = layer.regexp.source
          .replace(/\\\//g, "/")
          .match(/^\^\/\??(.*?)\\\/\?\(\?=\\\/\|\$\)/);
        if (match && match[1]) {
          path = "/" + match[1];
        }
      }
      routes.push(...getRoutes(layer.handle, basePath + path));
    }
  });
  return routes;
}

// Add this endpoint to list all routes
router.get("/endpoints", (req, res) => {
  const routes = getRoutes(router, "/api");
  console.log(`Total endpoints: ${routes.length}`);

  // Generate HTML page with professional design
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MrFranchise APi Endpoints Documentation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #3498db;
            --secondary-color: #2c3e50;
            --accent-color: #e74c3c;
            --light-bg: #f8f9fa;
            --dark-bg: #343a40;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--light-bg);
            color: var(--secondary-color);
        }
        .header {
            background: #ff9800;
            color: white;
            padding: 1.5rem 0;
            margin-bottom: 2rem;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .endpoint-card {
            border-left: 4px solid var(--primary-color);
            border-radius: 4px;
            margin-bottom: 1rem;
            transition: transform 0.2s, box-shadow 0.2s;
            background-color: white;
            cursor: pointer;
        }
        .method-get { border-left-color: #28a745; }
        .method-post { border-left-color: #007bff; }
        .method-put { border-left-color: #ffc107; }
        .method-delete { border-left-color: #dc3545; }
        .method-patch { border-left-color: #6f42c1; }
        .search-box {
            margin-bottom: 2rem;
            margin-Left: 30rem;
            width: 40%;
        }
        .footer {
            background-color: var(--secondary-color);
            color: white;
            padding: 1.5rem 0;
            margin-top: 3rem;
        }
        .copy-btn {
            border: none;
            background: none;
            color:rgb(247, 149, 1);
            cursor: pointer;
            
            font-size: 1.1em;
        }
        .copy-btn.copied {
            color: #28a745;
        }
    </style>
</head>
<body>
    <div class="header text-center">
        <div class="container">
            <h1>MrFranchise API Endpoints Documentation</h1>
            <p class="lead">Complete list of available API routes with their methods</p>
        </div>
    </div>
    <div class="search-box">
        <div class="input-group mb-3">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input type="text" id="searchInput" class="form-control" placeholder="Search endpoints...">
            <button class="btn btn-outline-secondary" type="button" id="clearSearch">Clear</button>
        </div>
    </div>
    <div class="accordion" id="endpointsAccordion">
        ${routes
          .map(
            (route, index) => `
        <div class="card endpoint-card method-${route.method.toLowerCase()}">
            <div class="card-header" id="heading${index}">
                <h2 class="mb-0 d-flex align-items-center">
                    <button class="btn btn-link text-decoration-none w-100 text-start d-flex justify-content-between align-items-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                        <span>
                            <span class="badge bg-${getMethodBadgeColor(
                              route.method
                            )} badge-method me-2">${route.method}</span>
                            <span class="endpoint-path" id="endpoint-path-${index}">${
              route.path
            }
                            <button class="copy-btn" title="Copy path" data-path="${
                              route.path
                            }" data-index="${index}">
                                <i class="fas fa-copy"></i>
                            </button>
                            </span>
                            
                        </span>
                    </button>
                </h2>
            </div>
        </div>
        `
          )
          .join("")}
    </div>
    <div class="text-center mt-4">
        <small class="text-muted">Last updated: ${new Date().toLocaleString()}</small>
        <p>© ${new Date().getFullYear()} API Documentation. All rights reserved.</p>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.endpoint-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        // Clear search
        document.getElementById('clearSearch').addEventListener('click', function() {
            document.getElementById('searchInput').value = '';
            const cards = document.querySelectorAll('.endpoint-card');
            cards.forEach(card => card.style.display = '');
        });
        // Copy path functionality
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const path = btn.getAttribute('data-path');
                navigator.clipboard.writeText(path).then(() => {
                    btn.classList.add('copied');
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 1200);
                });
            });
        });
    </script>
</body>
</html>
`;

  res.send(html);
});

// Helper function to get badge color based on HTTP method
function getMethodBadgeColor(method) {
  switch (method.toLowerCase()) {
    case "get":
      return "success";
    case "post":
      return "primary";
    case "put":
      return "warning";
    case "delete":
      return "danger";
    case "patch":
      return "info";
    default:
      return "secondary";
  }
}




export default router;
