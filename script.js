let map;
let service;
let autocomplete;
let marker;
let activeTab = null; // Track the currently expanded tab

// Initialize the autocomplete feature for location input
function initializeAutocomplete() {
    const input = document.getElementById('location-input');
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(['place_id', 'geometry', 'name', 'rating', 'user_ratings_total', 'formatted_address', 'photos', 'types']);
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

// Initialize the map
function initializeMap(latLng, mapContainer) {
    // If mapContainer is passed, render map in the dynamic tab
    const mapTarget = mapContainer ? mapContainer : document.getElementById('map');
    map = new google.maps.Map(mapTarget, {
        center: latLng,
        zoom: 14
    });

    // Add a marker at the selected location
    new google.maps.Marker({
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

// Function to display map, details, short summary, popularity indicator with image carousel
function displayDynamicTab(place, parentElement) {
    // Toggle expansion for each suggestion tab
    if (activeTab && activeTab !== parentElement) {
        activeTab.classList.remove('expanded');
        activeTab.querySelector('.dynamic-container').remove();
    }

    // Mark the current active tab
    activeTab = parentElement;

    // Expand the clicked suggestion tab from all sides
    parentElement.classList.toggle('expanded');

    // Create a container for the map and details
    const dynamicContainer = document.createElement('div');
    dynamicContainer.className = 'dynamic-container';

    // Add the name and formatted address (at the top)
    const suggestionText = document.createElement('div');
    suggestionText.className = 'suggestion-text';
    suggestionText.innerHTML = `
        <h3>${place.name}</h3>
        <p>${place.formatted_address || 'No address available'}</p>
    `;
    dynamicContainer.appendChild(suggestionText);

    // Add a map container (bottom-right)
    const mapContainer = document.createElement('div');
    mapContainer.className = 'dynamic-map';
    mapContainer.style.width = '48%';  // Adjusted width for layout
    mapContainer.style.height = '300px';
    dynamicContainer.appendChild(mapContainer);

    // Add a details container with additional information (bottom-left)
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'dynamic-details';
    const imageUrl = place.photos ? place.photos[0].getUrl({ maxWidth: 300 }) : 'default-image.jpg';
    const mapLink = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

    const summary = place.types.join(', ') || 'No description available.';
    const popularity = place.rating ? `${place.rating} / 5` : 'Not rated yet';

    // Create the carousel for images
    const carousel = document.createElement('div');
    carousel.className = 'image-carousel';
    const images = place.photos || [];
    images.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo.getUrl({ maxWidth: 300 });
        img.alt = `${place.name} image ${index + 1}`;
        img.classList.add('carousel-image');
        carousel.appendChild(img);
    });

    detailsContainer.innerHTML = `
        <p><strong>Summary:</strong> ${summary}</p>
        <p><strong>Popularity:</strong> ${popularity}</p>
        <a href="${mapLink}" target="_blank">View on Google Maps</a>
    `;
    detailsContainer.appendChild(carousel);
    dynamicContainer.appendChild(detailsContainer);

    // Insert the dynamic container after the clicked suggestion
    parentElement.appendChild(dynamicContainer);

    // Initialize the map inside the dynamic tab
    initializeMap(place.geometry.location, mapContainer);
}

// Fetch and display tourist attractions
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
                li.addEventListener('click', () => displayDynamicTab(result, li)); // Add dynamic tab on click
                attractionsList.appendChild(li);
            });
        } else {
            alert('Unable to fetch tourist attractions.');
        }
    });
}

// Apply the same logic for staying options and food options
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
                li.addEventListener('click', () => displayDynamicTab(result, li)); // Add dynamic tab on click
                stayList.appendChild(li);
            });
        } else {
            alert('Unable to fetch staying options.');
        }
    });
}

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
                li.addEventListener('click', () => displayDynamicTab(result, li)); // Add dynamic tab on click
                foodList.appendChild(li);
            });
        } else {
            alert('Unable to fetch food options.');
        }
    });
}
