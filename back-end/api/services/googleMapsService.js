const axios = require("axios");

const googleMapsUrl = "https://maps.googleapis.com/maps/api/geocode/json";

class GoogleMapsService {
  async getCoordinates(zipCode) {
    let result = await axios.get(googleMapsUrl, {
      params: {
        address: zipCode.toString(),
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    const data = result.data;
    const coordinates = [
      data.results[0].geometry.location.lng,
      data.results[0].geometry.location.lat,
    ];
    return coordinates;
  }
}

module.exports = GoogleMapsService;
