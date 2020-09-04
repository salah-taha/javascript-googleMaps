const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const Store = require("./api/models/store");
const GoogleMapsSrevice = require("./api/services/googleMapsService");
const googleMapsService = new GoogleMapsSrevice();

mongoose.connect("mongodb://localhost/google-maps-stores", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.json({ limit: "50mb" }));

app.post("/api/stores", async (req, res) => {
  let dbStores = [];
  let stores = req.body;

  stores.forEach((store) => {
    dbStores.push({
      storeName: store.name,
      phoneNumber: store.phoneNumber,
      address: store.address,
      openStatusText: store.openStatusText,
      addressLines: store.addressLines,
      location: {
        type: "Point",
        coordinates: [store.coordinates.longitude, store.coordinates.latitude],
      },
    });
  });

  await Store.create(dbStores);
  res.send("it is working");
});

app.delete("/api/stores", async (req, res) => {
  let result = await Store.deleteMany({});
  console.log(result);
  res.status(200).send("DONE");
});

app.get("/api/stores", async (req, res) => {
  const zipCode = req.query.zipcode;
  googleMapsService
    .getCoordinates(zipCode)
    .then(async (coordinates) => {
      let result = await Store.find({
        location: {
          $near: {
            $maxDistance: 3000,
            $geometry: {
              type: "Point",
              coordinates: coordinates,
            },
          },
        },
      });
      res.send(result);
    })
    .catch((err) => console.log(err));
});

app.listen(3000, () => console.log("Working"));
