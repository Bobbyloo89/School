// Försöker hämta en API-nyckel från keys-endpoint med POST-metoden
async function fetchApiKey() {
    try {
        const response = await fetch("https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/keys", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Kollar om response status är OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`); // Kastar ett error och visar felmeddelande om response status inte är OK
        }

        // Parsar response body som JSON och sparar i data-variabeln
        const data = await response.json();

        // Kollar om response innehåller en API-nyckel
        if (data.key) {
            return data.key; // Returnerar API-nyckel om den hittas i response
        } else {
            throw new Error('Ingen API-nyckel mottagen.'); // Kastar nytt error och visar felmeddelande om API-nyckel inte hittas i response
        }
    } catch (error) { // Fångar eventuella fel vid hämtning av API-nyckel
        console.error('Error vid hämtning av API-nyckel:', error.message);
    }
}

// Använder den hämtade API-nyckeln och försöker hämta info om planeterna från bodies-endpoint med GET-metoden
async function fetchBodies(apiKey) {
    try {
        const response = await fetch("https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/bodies", {
            method: 'GET',
            headers: {
                'x-zocom': apiKey // Den hämtade API-nyckeln inkluderas i request header
            }
        });

        // Kollar om response status är OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`); // Kastar ett error och visar felmeddelande om response status inte är OK
        }

        // Parsar response body som JSON och sparar i data-variabeln
        const data = await response.json();
        return data; // Returnerar infon om planeterna om den hittas i response
    } catch (error) { // Fångar eventuella fel vid hämtning av planetinfo (bodies)
        console.error('Error vid hämtning av planetinfo (bodies):', error.message);
    }
}

// Function som skapar stjärnor i bakgrunden
function createStars() {
    const container = document.querySelector('body');
    for (let i = 0; i < 1000; i++) { // Ändra för fler eller färre stjärnor
        const star = document.createElement('div'); // Skapar ett element
        star.className = 'star'; // Ger elementet en class (för att kunna styla med CSS)
        // star har position: absolute så vi kan tilldela den värden för top: och left: för att sprida ut dem över bakgrunden
        star.style.top = Math.random() * 100 + '%'; // Random vertikal position
        star.style.left = Math.random() * 100 + '%'; // Random horisontell position
        container.appendChild(star); // Lägg till stjärnan i bodyn
    }
}
createStars();

// Hämtar API-nyckel och använder den för att hämta planetinfo (bodies)
fetchApiKey().then(apiKey => {
    if (apiKey) {
        fetchBodies(apiKey).then(data => {
            if (data && data.bodies) { // Kollar så att data innehåller en bodies-array

                // Gör planeter i planetRow klickbara
                const planetsRow = document.getElementById('planetsRow'); // Tilldelar planetsRow en variabel
                const planetElements = planetsRow.querySelectorAll('.planetRow'); // Skapar en array med alla planeter i planetsRow

                // Lägger till en event listener på varje planet i planetRow som lyssnar efter klick
                planetElements.forEach(planet => { // Går igenom planetsRow-arrayen
                    planet.addEventListener('click', () => { // Lägger till event listener på varje planet

                        const planetName = planet.dataset.name; // Hämtar namnet på planeten
                        planetInput.value = planetName; // Simulerar att planetens namn skrivs in i inputfältet
                        searchButton.click(); // Simulerar klick på search-knappen
                    });
                });

                const searchButton = document.getElementById('searchButton'); // Tilldelar search-knappen en variabel
                const planetInput = document.getElementById('planetInput'); // Tilldelar inputfältet för planetsökning en variabel
                const infoBox = document.getElementById('infoBox'); // Tilldelar infoBoxen en variabel

                // Döljer infoBoxen till en början
                infoBox.style.display = 'none';

                // Event listener för tryck på Enter-tangenten när inputfältet är markerat
                planetInput.addEventListener('keydown', (event) => { // Lyssnar efter tangenttryck
                    if (event.key === 'Enter') { // Kollar om tryckt tangent är Enter
                        searchButton.click(); // Simulerar klick på search-knappen
                    }
                });

                // Event listener för search-knappen
                searchButton.addEventListener('click', () => { // Lyssnar efter klick
                    const planetName = planetInput.value.trim().toLowerCase(); // Tar emot värdet från inputfältet, tar bort whitespace med trim() och gör om till lowerCase
                    const planet = data.bodies.find(body => // Letar igenom bodies-arrayen med find()
                        body.name.toLowerCase() === planetName && // Jämför sökningen med namn i arrayen
                        body.type === 'planet' // Kollar att träffen på sökningen är en planet
                    );

                    // Om sökningen matchar namnet på en planet
                    if (planet) {
                        infoBox.innerHTML = ''; // Rensar innehållet i infoBox så vi kan fylla den med relevant data

                        // Skapar en container att visa vår planetinfo i
                        const infoBoxContent = document.createElement('div');
                        infoBoxContent.classList.add('infoBoxContent'); // Tilldelar vår container en class för att kunna styla med CSS

                        // Skapar element för planetens namn på svenska och latin
                        const heading = document.createElement('h2'); // Nytt element
                        heading.classList.add('infoHeader'); // Tilldelar class för CSS-styling
                        heading.textContent = `${planet.name} | ${planet.latinName}`; // Lägger in data från vår sökning
                        infoBoxContent.appendChild(heading); // Lägger till elementet till vår infoBoxContent

                        // Skapar element för beskrivning av planeten
                        const infoDescBox = document.createElement('section'); // Nytt element, container för beskrivningen för CSS-styling
                        infoDescBox.classList.add('infoDescBox'); // Tilldelar container en class för CSS-styling
                        const infoDesc = document.createElement('p'); // Nytt element, beskrivning av planeten
                        infoDesc.textContent = `${planet.desc || 'Data not available'}`; // Lägger in data från vår sökning
                        infoDescBox.appendChild(infoDesc); // Lägger till beskrivningen till container för beskrivning
                        infoBoxContent.appendChild(infoDescBox); // Lägger till container för beskrivning till infoBoxContent

                        // Skapar element för omkrets
                        const infoCircBox = document.createElement('section'); //Nytt element, container för omkrets
                        infoCircBox.classList.add('infoCircBox'); // Tilldelar container en class för CSS-styling
                        const infoCircLabel = document.createElement('h3'); // Nytt element, omkretsrubrik
                        infoCircLabel.textContent = 'OMKRETS';
                        const infoCirc = document.createElement('p'); // Nytt element, omkretsvärde
                        infoCirc.textContent = `${planet.circumference || 'Data not available'} km`; // Lägger in data från vår sökning
                        infoCircBox.appendChild(infoCircLabel); // Lägger till omkretsrubrik till container för omkrets
                        infoCircBox.appendChild(infoCirc); // Lägger till omkretsvärde till container för omkrets
                        infoBoxContent.appendChild(infoCircBox); // Lägger till container för omkrets till infoBoxContent

                        // Skapar element för avstånd från solen
                        const infoDistBox = document.createElement('section'); // Nytt element, container för avstånd
                        infoDistBox.classList.add('infoDistBox'); // Tilldelar container en class för CSS-styling
                        const infoDistLabel = document.createElement('h3'); // Nytt element, avståndsrubrik
                        infoDistLabel.textContent = 'KM FRÅN SOLEN';
                        const infoDist = document.createElement('p'); // Nytt element, avståndsvärde
                        infoDist.textContent = `${planet.distance || 'Data not available'} km`; // Lägger in data från vår sökning
                        infoDistBox.appendChild(infoDistLabel); // Lägger till avståndsrubrik till container för avstånd
                        infoDistBox.appendChild(infoDist); // Lägger till avståndsvärde till container för avstånd
                        infoBoxContent.appendChild(infoDistBox); // Lägger till container för avstånd till infoBoxContent

                        // Skapar element för temperatur
                        const infoTempBox = document.createElement('section'); // Nytt element, container för temperatur
                        infoTempBox.classList.add('infoTempBox'); // Tilldelar container en class för CSS-styling
                        const infoTempLabel = document.createElement('h3'); // Nytt element, temperaturrubrik
                        infoTempLabel.textContent = 'MAX / MIN TEMPERATUR';
                        const infoTemp = document.createElement('p'); // Nytt element, temperaturvärde
                        infoTemp.textContent = `${planet.temp.day || 'Data not available'}C   |   ${planet.temp.night || 'Data not available'}C`; // Lägger in data från vår sökning
                        infoTempBox.appendChild(infoTempLabel); // Lägger till temperaturrubrik till container för temperatur
                        infoTempBox.appendChild(infoTemp); // Lägger till temperaturvärde till container för temperatur
                        infoBoxContent.appendChild(infoTempBox); // Lägger till container för temperatur till infoBoxContent

                        // Skapar element för omloppsperiod
                        const infoOrbitBox = document.createElement('section'); // Nytt element, container för omloppsperiod
                        infoOrbitBox.classList.add('infoOrbitBox'); // Tilldelar container en class för CSS-styling
                        const infoOrbitLabel = document.createElement('h3'); // Nytt element, omloppsperiodrubrik
                        infoOrbitLabel.textContent = 'OMLOPPSPERIOD';
                        const infoOrbit = document.createElement('p'); // Nytt element, värde för omloppsperiod
                        infoOrbit.textContent = `${planet.orbitalPeriod || 'Data not available'} dygn`; // Lägger in data från vår sökning
                        infoOrbitBox.appendChild(infoOrbitLabel); // Lägger till omloppsperiodrubrik till container för omloppsperiod
                        infoOrbitBox.appendChild(infoOrbit); // Lägger till omloppsperiodvärde till container för omloppsperiod
                        infoBoxContent.appendChild(infoOrbitBox); // Lägger till container för omloppsperiod till infoBoxContent

                        // Skapar element för månar
                        const infoMoonsBox = document.createElement('section'); // Nytt element, container för månar
                        infoMoonsBox.classList.add('infoMoonsBox'); // Tilldelar container en class för CSS-styling
                        const infoMoonsLabel = document.createElement('h3'); // Nytt element, månar-rubrik
                        infoMoonsLabel.textContent = 'MÅNAR';
                        const infoMoons = document.createElement('p'); // Nytt element, värde för månar
                        infoMoons.textContent = planet.moons ? planet.moons.join(', ') : 'Data not available'; // Lägger in data från vår sökning. Använder join() för att styla output
                        infoMoonsBox.appendChild(infoMoonsLabel); // Lägger till månar-rubrik till container för månar
                        infoMoonsBox.appendChild(infoMoons); // Lägger till värde för månar till container för månar
                        infoBoxContent.appendChild(infoMoonsBox); // Lägger till container för månar till infoBoxContent

                        // Skapar knapp för att stänga fönster med planetinfo
                        const closeButton = document.createElement('button'); // Nytt element, knapp
                        closeButton.textContent = ' X ';
                        closeButton.id = 'closeButton'; // Tilldelar knapp ett ID
                        closeButton.classList.add('closeButton'); // Tilldelar knapp en class för CSS-styling
                        closeButton.addEventListener('click', () => { // Lägger till event listener för klick på knappen
                            infoBox.innerHTML = ''; // Tar bort data i infoBox när knappen klickas
                            infoBox.style.display = 'none'; // Stänger (döljer) infoBox när knappen klickas
                        });
                        infoBoxContent.appendChild(closeButton); // Lägger till "Stäng"-knapp till infoBoxContent

                        infoBox.appendChild(infoBoxContent); // Lägger till infoBoxContent till infoBox
                        infoBox.style.display = 'flex'; // Öppnar infoBox (gör synlig) för att visa planetinfo
                    } else {
                        // Visar felmeddelande om planeten inte hittas (felaktig input i inputfältet)
                        infoBox.innerHTML = ''; // Tar bort data i infoBox

                        // Skapar och visar felmeddelande
                        const errorMessage = document.createElement('p'); // Nytt element, felmeddelande
                        errorMessage.classList.add('errorMessage'); // Tilldelar felmeddelande en class för CSS-styling
                        errorMessage.textContent = 'Inmatning felaktig, kolla stavning och prova igen. ';
                        infoBox.appendChild(errorMessage); // Lägger till felmeddelandet till infoBox

                        // Skapar knapp för att stänga felmeddelande
                        const closeErrorButton = document.createElement('button'); // Nytt element, "Stäng"-knapp för felmeddelande
                        closeErrorButton.classList.add('closeErrorButton'); // Tilldelar "Stäng"-knapp en class för CSS-styling
                        closeErrorButton.textContent = ' X ';
                        closeErrorButton.addEventListener('click', () => { // Lägger till event listener för klick på knappen
                            infoBox.innerHTML = ''; // Tar bort data i infoBox när knappen klickas
                            infoBox.style.display = 'none'; // Stänger (döljer) infoBox när knappen klickas
                        });
                        infoBox.appendChild(closeErrorButton); // Lägger till "Stäng"-knapp till infoBoxContent

                        infoBox.style.display = 'flex'; // Öppnar infoBox (gör synlig) för att visa felmeddelande
                    }
                });
            } else {
                console.log('Fetch bodies misslyckades.'); // Skriver ut felmeddelande i console om data inte innehåller en bodies-array
            }
        });
    } else {
        console.log('Fetch API-key misslyckades'); // Skriver ut felmeddelande i console om data inte innehåller en API-nyckel
    }
});