

export default function getUserFuelLevel(tokenId: number, privToken: string){
    fetch('https://telemetry-api.dimo.zone/query', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${privToken}`
        },
        body: JSON.stringify({
            query: `{
                signalsLatest (
                    tokenId: ${tokenId}
                    filter: {
                        source: "tesla"
                        })
                    {
                    powertrainFuelSystemAbsoluteLevel {
                        value
                    }
                }
              }`
        })
    }).then(async (response) => {
        console.log("GOT RESPONSE FOR FUEL LEVEL: ", response);
        const r = await response.json();
        console.log("Parsed JSON: ", r);
    
        if (r.data && r.data.signalsLatest) {
            const fuelLevel = r.data.signalsLatest.powertrainFuelSystemAbsoluteLevel?.value;
            return fuelLevel;
        } else {
            console.error("No data or signalsLatest in response");
            return null;
        }
    }).then((data) => {
        console.log("Fuel Data: ", data);
        return data
    }).catch((error) => console.error('Error:', error));
    
}