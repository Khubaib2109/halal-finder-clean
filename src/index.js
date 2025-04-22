const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.get("/halal-places", async (req, res) => {
  const location = req.query.location;
  const query = `halal near ${location}`;

  try {
    const searchResponse = await axios.get("https://maps.googleapis.com/maps/api/place/textsearch/json", {
      params: {
        query,
        key: GOOGLE_API_KEY,
      },
    });

    const places = searchResponse.data.results;

    const detailedResults = await Promise.all(
      places.map(async (place) => {
        try {
          const detailResponse = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
            params: {
              place_id: place.place_id,
              fields: "name,rating,formatted_address,geometry,reviews",
              key: GOOGLE_API_KEY,
            },
          });

          const details = detailResponse.data.result;
          const reviews = details.reviews || [];
          const reviewTexts = reviews.map((r) => r.text);
          const halalMentions = reviewTexts.filter((text) => /halal/i.test(text));
          const nameMatches = /halal/i.test(details.name);

          return {
            name: details.name,
            address: details.formatted_address,
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
            rating: details.rating,
            halalMentions,
            isLikelyHalal: nameMatches || halalMentions.length > 0,
          };
        } catch (err) {
          console.error("Failed to fetch details for a place:", err.message);
          return null;
        }
      })
    );

    // Filter out failed fetches
    const filtered = detailedResults.filter(Boolean);

    // Return all, but highlight "likely halal"
    res.json(filtered);
  } catch (err) {
    console.error("Error during place search:", err.message);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
