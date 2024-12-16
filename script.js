let map;
let service;
let autocomplete;
let marker;

// Initialize the autocomplete feature for location input
function initializeAutocomplete() {
    const input = document.getElementById('location-input');
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(['place_id', 'geometry', 'name']);
    autocomplete.addListener('place_changed', onPlaceChanged);
}

// Handle place change in autocomplete
function onPlaceChanged() {
    const place = autocomplete.getPlace();
    if (place.geometry) {
        const latLng = place.geometry.location;
        initializeMap(latLng);
    } else {
        alert('Please select a valid location.');
    }
}

// Initialize the map and service
function initializeMap(latLng) {
    // Create a new map centered at the selected location
    map = new google.maps.Map(document.getElementById('map'), {
        center: latLng,
        zoom: 14
    });

    // Add a marker at the selected location
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: 'Selected Location'
    });

    // Initialize places service
    service = new google.maps.places.PlacesService(map);
}

// Fetch suggestions based on location and interests
function fetchSuggestions() {
    const location = document.getElementById('location-input').value;
    const geocoder = new google.maps.Geocoder();

    if (location) {
        geocoder.geocode({ 'address': location }, function (results, status) {
            if (status === 'OK') {
                const latLng = results[0].geometry.location;
                initializeMap(latLng);
                
                const interests = document.getElementById('interests').value;
                const budget = document.getElementById('budget-input').value;
                
                fetchTouristAttractions(latLng, interests);
                fetchStayingOptions(latLng, budget);
                fetchLocalFood(latLng, budget);
            } else {
                alert('Geocode was not successful: ' + status);
            }
        });
    } else {
        alert('Please enter a location.');
    }
}

// Function to fetch tourist attractions
function fetchTouristAttractions(latLng, interests) {
    const request = {
        location: latLng,
        radius: 5000,
        type: ['tourist_attraction'],
        keyword: interests
    };
    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const attractionsList = document.getElementById('attractions-list');
            attractionsList.innerHTML = '';
            results.forEach(result => {
                const li = document.createElement('li');
                const imageUrl = result.photos ? result.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 }) : 'default-image.jpg';
                
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = result.name;
                
                const infoDiv = document.createElement('div');
                infoDiv.classList.add('info');
                const h3 = document.createElement('h3');
                h3.textContent = result.name;
                const p = document.createElement('p');
                p.textContent = result.vicinity || 'No address available';

                infoDiv.appendChild(h3);
                infoDiv.appendChild(p);

                li.appendChild(img);
                li.appendChild(infoDiv);
                attractionsList.appendChild(li);
            });
        } else {
            alert('Unable to fetch tourist attractions.');
        }
    });
}

// Function to fetch staying options
function fetchStayingOptions(latLng, budget) {
    const request = {
        location: latLng,
        radius: 5000,
        type: ['lodging']
    };
    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const stayList = document.getElementById('stay-list');
            stayList.innerHTML = '';
            results.forEach(result => {
                const li = document.createElement('li');
                const imageUrl = result.photos ? result.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 }) : 'default-image.jpg';

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = result.name;
                
                const infoDiv = document.createElement('div');
                infoDiv.classList.add('info');
                const h3 = document.createElement('h3');
                h3.textContent = result.name;
                const p = document.createElement('p');
                p.textContent = result.vicinity || 'No address available';

                infoDiv.appendChild(h3);
                infoDiv.appendChild(p);

                li.appendChild(img);
                li.appendChild(infoDiv);
                stayList.appendChild(li);
            });
        } else {
            alert('Unable to fetch staying options.');
        }
    });
}

// Function to fetch local food options
function fetchLocalFood(latLng, budget) {
    const request = {
        location: latLng,
        radius: 5000,
        type: ['restaurant']
    };
    service.nearbySearch(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const foodList = document.getElementById('food-list');
            foodList.innerHTML = '';
            results.forEach(result => {
                const li = document.createElement('li');
                const imageUrl = result.photos ? result.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 }) : 'default-image.jpg';

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = result.name;
                
                const infoDiv = document.createElement('div');
                infoDiv.classList.add('info');
                const h3 = document.createElement('h3');
                h3.textContent = result.name;
                const p = document.createElement('p');
                p.textContent = result.vicinity || 'No address available';

                infoDiv.appendChild(h3);
                infoDiv.appendChild(p);

                li.appendChild(img);
                li.appendChild(infoDiv);
                foodList.appendChild(li);
            });
        } else {
            alert('Unable to fetch food options.');
        }
    });
}
