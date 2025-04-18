import { ApiResponse } from "../../Middleware/ApiResponse.js"
// import { sendEmailOTP } from "../../utils/sendEmailOTP.js";



const investorLogin = async (req, res) => {
    try {
        const { email, phone } = req.body;
        console.log(req.body)

        if (!email && !phone) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    "Please provide either email or phone number"
                )
            );
        }
        // sendEmailOTP(email)

        // if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        //     return res.status(400).json(
        //         new ApiResponse(400, null, "Invalid email format")
        //     );
        // }

        // if (phone && (!/^\d{10}$/.test(phone))) {
        //     return res.status(400).json(
        //         new ApiResponse(400, null, "Phone number must be 10 digits")
        //     );
        // }

        // const data = await ThirdPartyAuth.findOne({
        //     $or: [
        //         email ? { email: email } : {},
        //         phone ? { phone: phone } : {}
        //     ]
        // });

        // if (!data) {
        //     return res.status(404).json(
        //         new ApiResponse(
        //             404,
        //             null,
        //             "User not found"
        //         )
        //     );
        // }

        
        // return res.status(200).json(
        //     new ApiResponse(
        //         200,
        //         data,
        //         "User found"
        //     )
        // );
    } catch (error) {
        console.error("Investor login error:", error);
        return res.status(500).json(
            new ApiResponse(
                500,
                null,
                "Internal Server Error"
            )
        );
    }
};


export {
    investorLogin
}