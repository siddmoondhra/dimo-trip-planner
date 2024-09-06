
export default function Location(tokenId: number, privToken: string) {
    console.log("in location");

    return fetch('https://telemetry-api.dimo.zone/query', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${privToken}`
        },
        body: JSON.stringify({
            query: `{
                signalsLatest(
                    tokenId: ${tokenId},
                    filter: {
                        source: "tesla"
                        })
                    {
                    currentLocationLongitude {
                        value 
                    }
                    currentLocationLatitude {
                        value 
                    }
                }
            }`
        })
    })
    .then(async (response) => {
        console.log("GOT RESPONSE FOR LOCATION", response);
        const r = await response.json();
        console.log("Parsed JSON response:", r);

        // Extract the latitude and longitude from the response
        const latitude = r.data.signalsLatest.currentLocationLatitude.value;
        const longitude = r.data.signalsLatest.currentLocationLongitude.value;

        return { latitude, longitude };
    })
    .then((location) => {
        console.log("Extracted Location Data:", location);
        return location;
    })
    .catch((error) => console.error('Error:', error));
}