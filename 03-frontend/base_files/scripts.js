document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // Récupère le token stocké dans les cookies
    const token = getCookie('token');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Envoie la requête de login
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                // Stocke le token dans les cookies
                document.cookie = `token=${data.access_token}; path=/`;
                window.location.href = 'index.html';
            } else {
                document.getElementById('error-message').innerText = 'Login failed: An error has occurred';
            }
        });
    }

    // Vérifie si l'utilisateur est authentifié
    function checkAuthentication() {
        const token = getCookie('token');
        if (!token) {
            window.location.href = 'index.html';
        }
        return token;
    }

    // Fonction pour récupérer les cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // All places part //
    if (document.getElementById('places-list')) {
        let places = [];

        // Récupère les lieux avec le token dans l'en-tête Authorization
        async function fetchPlaces() {
            const response = await fetch('http://127.0.0.1:5000/places', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                places = await response.json();
                displayPlaces(places);
            }
        }

        fetchPlaces();

        // Affiche les lieux récupérés
        function displayPlaces(places) {
            const placesList = document.getElementById('places-list');
            placesList.innerHTML = '';

            places.forEach((place, index) => {
                const placeCard = document.createElement('div');
                placeCard.className = 'place-card';

                // Utiliser une image locale pour chaque hébergement
                const imagePath = `images/image${index + 1}.jpg`;

                placeCard.innerHTML = `
                <img src="${imagePath}" alt="${place.description}" class="place-image">
                <h2>${place.description}</h2>
                <p>Price per night: $ ${place.price_per_night}</p>
                <p>Location: ${place.city_name}, ${place.country_name}</p>
                <button id="details-button" data-place-id="${place.id}">View details</button>
                `;
                placesList.appendChild(placeCard);
            });
            goToPlaceDetails();
        }

        // Ajoute les événements pour naviguer vers les détails d'un lieu
        function goToPlaceDetails() {
            const buttons = document.querySelectorAll('#details-button');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetId = button.getAttribute('data-place-id');
                    const imageUrl = button.parentElement.querySelector('.place-image').src; // Récupère l'URL de l'image
                    window.location.href = `place.html?id=${targetId}&image=${encodeURIComponent(imageUrl)}`;
                });
            });
        }

        // Filtre les lieux par pays
        function filterPlacesByCountry(country) {
            if (country === "all") {
                displayPlaces(places);
            } else {
                const filteredPlaces = places.filter(place => place.country_name === country);
                displayPlaces(filteredPlaces);
            }
        }

        document.getElementById('country-filter').addEventListener('change', (event) => {
            filterPlacesByCountry(event.target.value);
        });
    }

    function getIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    function getImageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('image');
    }

    // Load the add review form
    async function loadAddReview() {
        const response = await fetch('add_review.html');
        const html = await response.text();
        document.getElementById('add-review').innerHTML = html;
        const reviewForm = document.getElementById('review-form');
        setupReviewForm(reviewForm);
    }

    // Partie pour afficher les détails d'un lieu
    if (document.getElementById('place-details')) {
        const placeId = getIdFromUrl();
        const imageUrl = getImageFromUrl(); // Récupère l'URL de l'image
        if (placeId) {
            fetchPlaceDetails(placeId);
            displayPlaceImage(imageUrl); // Affiche l'image
            loadAddReview();
        }
        if (!token) {
            document.getElementById('add-review').style.display = 'none';
        }
    }

    // Récupère les détails d'un lieu avec le token dans l'en-tête Authorization
    async function fetchPlaceDetails(placeId) {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
            displayReviews(place);
        }
    }

    // Fonction pour afficher l'image de l'hébergement
    function displayPlaceImage(imageUrl) {
        const imageContainer = document.createElement('div');
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="Place Image" class="place-image-large">`;
        const placeDetails = document.getElementById('place-details');
        placeDetails.insertBefore(imageContainer, placeDetails.firstChild); // Insère l'image avant les détails
    }

    // Affiche les détails d'un lieu
    function displayPlaceDetails(place) {
        const placeDetails = document.getElementById('place-details');
        placeDetails.innerHTML += `
            <h2 class="title">${place.description}</h2>
            <div class="place-detail-card">
            <ul>
            <li><strong>Host:</strong> ${place.host_name}</li>
            <li><strong>Price per night:</strong> $${place.price_per_night}</li>
            <li><strong>Location:</strong> ${place.city_name}, ${place.country_name}</li>
            <li><strong>Description:</strong> ${place.description}</li>
            <li><strong>Amenities:</strong> ${place.amenities}</li>
            </ul>
            </div>
        `;
    }

    // Affiche les revues d'un lieu
    function displayReviews(place) {
        const reviewTitle = document.getElementById('title');
        if (place.reviews.length) {
            reviewTitle.innerHTML = '<h2 class="title">Reviews</h2>';
        } else {
            reviewTitle.innerHTML = '';
        }
        const displayReviews = document.getElementById('review-card');
        displayReviews.innerHTML = '';
        let reviewsHtml = '';
        place.reviews.forEach(review => {
            reviewsHtml += `
            <div class="review-card">
                <p><strong>${review.user_name}</strong></p>
                <p>${review.comment}</p>
                <p>Rating: ${getStars(review.rating)}</p>
            </div>
            `;
        });
        displayReviews.innerHTML = reviewsHtml;
    }

    function getStars(rating) {
        const fullStar = '★';
        const emptyStar = '☆';
        let stars = '';

        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? fullStar : emptyStar;
        }

        return stars;
    }

    // Setup the review form and create a new review with the token in the Authorization header
    function setupReviewForm(reviewForm) {
        if (reviewForm) {
            const placeId = getIdFromUrl();
            if (placeId) {
                reviewForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const reviewText = document.getElementById('review-text').value;
                    const ratingValue = document.getElementById('review-rating').value;

                    const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ review: reviewText, rating: ratingValue, place_id: placeId })
                    });

                    handleResponse(response, reviewForm, placeId);
                });
            }
        }
    }

    // Handle the response from the review submission
    function handleResponse(response, reviewForm, placeId) {
        if (response.ok) {
            alert('Review submitted successfully!');
            reviewForm.reset();
            fetchPlaceDetails(placeId);
        } else {
            alert('Failed to submit review');
        }
    }

    // Ajout du gestionnaire d'événement pour le bouton "Add Review"
    const addReviewButton = document.getElementById('add-review-button');
    if (addReviewButton) {
        addReviewButton.addEventListener('click', () => {
            if (!token) {
                window.location.href = 'login.html';
            } else {
                window.location.href = 'add_review.html';
            }
        });
    }
});
