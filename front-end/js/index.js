let map;
let infoWindow;
let markers = [];

function initMap() {
  let LosAnglos = { lat: 34.063584, lng: -118.376354 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: LosAnglos,
    zoom: 8,
  });
  infoWindow = new google.maps.InfoWindow();
}

const onEnter = (e) => {
  if (e.key == "Enter") {
    getStores();
  }
};

const getStores = async () => {
  const zipCode = document.getElementById("zip-code").value;
  if (!zipCode) {
    return;
  }
  const API_URL = "http://localhost:3000/api/stores?zipcode=" + zipCode;
  let storesData = await fetch(API_URL, { method: "GET" }).catch((err) => {
    clearLocations();
    noStoresFound();
  });
  let stores = await storesData.json();
  if (stores.length > 0) {
    clearLocations();
    searchLocationsNear(stores);
    setStoresList(stores);
    setOnClickListener();
  } else {
    clearLocations();
    noStoresFound();
  }
};

const noStoresFound = () => {
  const html = `
    <div class="no-stores-found">
        No stores found
    </div>
  `;
  document.getElementById("stores-list").innerHTML = html;
};

const clearLocations = () => {
  InfoWindow.close();
  markers.foreah((marker) => {
    marker.setMap(null);
  });
  markers.length = 0;
};

const searchLocationsNear = (stores) => {
  let bounds = new google.maps.LatLngBounds();
  stores.forEach((store, index) => {
    const coordinates = store.location.coordinates;
    let latlng = new google.maps.LatLng(coordinates[1], coordinates[0]);
    let name = store.storeName;
    let address = store.addressLines[0];
    let fullAddress = `${store["addressLines"][0]} ${store["addressLines"][1]}`;
    let phoneNumber = store.phoneNumber;
    let openStatusText = store.openStatusText;
    bounds.extend(latlng);
    createMarker(
      name,
      address,
      latlng,
      index + 1,
      fullAddress,
      phoneNumber,
      openStatusText
    );
  });
  map.fitBounds(bounds);
};

const createMarker = (
  name,
  address,
  latlng,
  storeIndex,
  fullAddress,
  phoneNumber,
  openStatusText
) => {
  let googleUrl = new URL("https://www.google.com/maps/dir/");
  googleUrl.searchParams.append("api", "1");
  googleUrl.searchParams.append("destination", fullAddress);
  var contentString = `
  <div class="store-info-window">
      <div class="store-info-name">
          ${name}
      </div>
      <div class="store-info-open-status">
          ${openStatusText}
      </div>
      <div class="store-info-address">
          <div class="icon">
              <i class="fas fa-location-arrow"></i>
          </div>
          <span>
              <a target="_blank" href="${googleUrl.href}">${address}</a>
          </span>
      </div>
      <div class="store-info-phone">
          <div class="icon">
              <i class="fas fa-phone-alt"></i>
          </div>
          <span><a href="tel:${phoneNumber}">${phoneNumber}</a></span>
      </div>
  </div>
`;

  var infowindow = new google.maps.InfoWindow({
    content: contentString,
  });
  let marker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: name,
    label: storeIndex.toString(),
  });
  marker.addListener("click", function () {
    infowindow.open(map, marker);
  });
  markers.push(marker);
};

const setOnClickListener = () => {
  let storeElements = document.querySelectorAll(".store-container");
  storeElements.forEach((element, index) => {
    element.addEventListener("click", () => {
      google.maps.event.trigger(markers[index], "click");
    });
  });
};

const setStoresList = (stores) => {
  let storesList = "";
  stores.forEach((store, index) => {
    let name = store.storeName;
    let address = store.addressLines[0];
    let phoneNumber = store.phoneNumber;
    let html = `
        <div class="store-container">
        <div class="store-container-background">
            <div class="store-info-container">
                <div class="store-address"><span>${name}</span><span>${address}</span></div>
                <div class="store-phone-number">${phoneNumber}</div>
            </div>
            <div class="store-number-container">
                <div class="store-number">${index + 1}</div>
            </div>
            </div>
        </div>
    `;
    storesList += html;
  });

  document.getElementById("stores-list").innerHTML = storesList;
};
