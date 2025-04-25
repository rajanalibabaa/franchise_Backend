
const getAdminImage = async  (req, res) => {
    try {
         

    } catch (error) {
        console.error("Error rendering manage image page:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Internal Server Error")
        );
    }
}