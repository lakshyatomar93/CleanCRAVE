const axios = require("axios");

// ============================================================
// CHECK WHETHER AN IMAGE URL IS ACTUALLY USABLE
// ============================================================

const isImageUrlValid = async (url) => {
  if (!url) {
    return false;
  }

  try {
    const response = await axios.head(url, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: (status) =>
        status >= 200 && status < 400,
    });

    const contentType =
      response.headers["content-type"] || "";

    return (
      response.status >= 200 &&
      response.status < 400 &&
      contentType.startsWith("image/")
    );
  } catch (error) {
    console.log(
      `Image validation failed: ${url}`
    );

    return false;
  }
};


// ============================================================
// SEARCH FOOD IMAGE ON PEXELS
// ============================================================

const searchFoodImage = async (
  foodName,
  usedImageUrls = new Set()
) => {
  try {
    if (!process.env.PEXELS_API_KEY) {
      console.log(
        "PEXELS_API_KEY is missing"
      );

      return null;
    }

    // --------------------------------------------------------
    // Better search queries
    // --------------------------------------------------------

    const queries = [
      `${foodName} food`,
      `${foodName} Indian food`,
      `${foodName} dish`,
      foodName,
    ];

    // --------------------------------------------------------
    // Search each query
    // --------------------------------------------------------

    for (const query of queries) {
      try {
        console.log(
          `🔎 Searching Pexels images for: "${query}"`
        );

        const response = await axios.get(
          "https://api.pexels.com/v1/search",
          {
            headers: {
              Authorization:
                process.env.PEXELS_API_KEY,
            },

            params: {
              query,

              // Get enough images so we can
              // skip duplicates/bad URLs.
              per_page: 30,

              orientation: "landscape",

              // Prefer larger images.
              size: "large",
            },

            timeout: 10000,
          }
        );

        const photos =
          response.data?.photos || [];

        if (!photos.length) {
          console.log(
            `No Pexels images found for "${query}"`
          );

          continue;
        }

        // ----------------------------------------------------
        // Remove already-used images
        // ----------------------------------------------------

        const availablePhotos =
          photos.filter((photo) => {
            const imageUrl =
              photo?.src?.large2x ||
              photo?.src?.large ||
              photo?.src?.original ||
              "";

            if (!imageUrl) {
              return false;
            }

            return !usedImageUrls.has(
              imageUrl
            );
          });

        if (!availablePhotos.length) {
          console.log(
            `All images already used for "${query}"`
          );

          continue;
        }

        // ----------------------------------------------------
        // Try several images until we find
        // an actually usable image.
        // ----------------------------------------------------

        // Shuffle candidates so different foods
        // don't always get the first result.
        const shuffledPhotos = [
          ...availablePhotos,
        ].sort(() => Math.random() - 0.5);

        // Don't validate all 30 images.
        // Try the first 8 candidates.
        const candidates =
          shuffledPhotos.slice(0, 8);

        for (const photo of candidates) {
          const imageUrl =
            photo?.src?.large2x ||
            photo?.src?.large ||
            photo?.src?.original ||
            "";

          if (!imageUrl) {
            continue;
          }

          console.log(
            `🖼️ Checking image: ${imageUrl}`
          );

          const valid =
            await isImageUrlValid(
              imageUrl
            );

          if (!valid) {
            console.log(
              `❌ Invalid image skipped`
            );

            continue;
          }

          console.log(
            `✅ Valid Pexels image selected`
          );

          return {
            url: imageUrl,

            source: "Pexels",

            photographer:
              photo.photographer || "",

            photographerUrl:
              photo.photographer_url || "",

            pageUrl:
              photo.url || "",

            pexelsId:
              photo.id || null,
          };
        }
      } catch (queryError) {
        console.log(
          `Image search failed for "${query}":`,
          queryError.response?.data
            ?.error ||
          queryError.message
        );
      }
    }

    console.log(
      `❌ No usable image found for ${foodName}`
    );

    return null;
  } catch (error) {
    console.error(
      "Image API error:",
      error.response?.data ||
      error.message
    );

    return null;
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  searchFoodImage,
  isImageUrlValid,
};