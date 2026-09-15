const User = require("../models/User");

const {
  getRecommendations,
} = require("../services/recommendationService");


const getUserRecommendations = async (
  req,
  res
) => {

  try {

    console.log(
      "JWT USER:",
      req.user
    );


    const userId =
      req.user.userId ||
      req.user.id;


    const user =
      await User.findById(userId)
        .lean();


    console.log(
      "FOUND USER:",
      user
    );


    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }


    const result =
      await getRecommendations(user);


    res.json({
      success: true,
      ...result,
    });


  } catch (error) {

    console.error(
      "========== RECOMMENDATION ERROR =========="
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Stack:",
      error.stack
    );

    console.error(
      "=========================================="
    );


    res.status(500).json({

      success: false,

      message:
        "Failed to generate recommendations",

      error:
        error.message,

    });

  }

};


module.exports = {
  getUserRecommendations,
};