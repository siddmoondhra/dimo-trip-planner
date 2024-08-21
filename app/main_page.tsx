"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  APIProvider,
  Map,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";
import "./styles.css";
import Cookies from "js-cookie";
import { useQuery, gql } from "@apollo/client";
import location from '../components/data/location'



// Define the type for the props of the Directions component
interface DirectionsProps {
  destinationInput: string;
}

var client_id = "0x1E0B0e5Aa4ABf2D2927639933d1324B6804538c3"

export default function TripPlanner() {
  /* 
  Variables
  */
  



  const position = {
    lat: 37.2063119,
    lng: -121.8620807,
  };
  const zoom = 10;

  // State to store user input for destination
  const [destinationInput, setDestinationInput] = useState<string>("");
  // State to store the submitted input
  const [submittedInput, setSubmittedInput] = useState<string>("");

  console.log("START")
  
  useEffect(() => {
    console.log("In USEEFFECT")
    if (!readCookies()) {
      Cookies.set("fetchAuth", "true")
      console.log("Cookies not found, going to FETCH")
      var base_url = "https://auth.dimo.zone/auth"
      var redirect_uri = "http://localhost:3000/"
      var extra_tail = "scope=openid email&response_type=code"
      var url = base_url+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&"+extra_tail
      console.log("FETCHing from "+url)
      window.location.href = url
      //Cookies.set("user", "authPassed", { expires: 14 });
      //var accessToken = getAccessCode()
      //console.log("after auth and fetch access code: "+accessToken)
      //var tokenID = getTokenID()
      console.log("getting access code")
      getAccessCode()
      //Cookies.set("access", accessToken, {expires: 14})
      //Cookies.set("tokenID", tokenID, {expires: 14})
    } else {
      console.log("Found cookies!")
    }
  }, []);

  var tokenID = Cookies.get("tokenID")
  ///console.log("access token:" + accessToken)
  console.log("tokenID: " + tokenID)

  // Function to handle changes in the input
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDestinationInput(event.target.value);
  };

  // Function to handle form submission
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedInput(destinationInput); // Update submitted input
  };


  /* 
  Main Return
  */
  return (
    <div style={{ height: "65vh", width: "100%", position: "relative" }}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}>
        <Map
          defaultCenter={position}
          defaultZoom={zoom}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
        >
          <Directions destinationInput={submittedInput} />
          <Logout />
        </Map>
      </APIProvider>
      <form className="input-container" onSubmit={handleFormSubmit}>
        <label htmlFor="destinationInput" style={{ color: "white" }}>
          Destination:
        </label>
        <input
          type="text"
          id="destinationInput"
          value={destinationInput}
          onChange={handleInputChange}
          style={{ color: "black" }}
        />
        <button type="submit" style={{ color: "white" }}>
          Submit
        </button>

      </form>
    </div>
  );
}

/* 
  Other Functions
*/
function Directions({ destinationInput }: DirectionsProps) {
  // Access the map
  const map = useMap();
  // Dynamically load routes library
  const position = {
    lat: 37.2063119,
    lng: -121.8620807,
  };
  const routesLibrary = useMapsLibrary("routes");
  // Find directions then render them onto the map
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  // The selected route and leg within the route
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsRenderer || !directionsService || !destinationInput) return;

    // Edit this: origin should be user location, destination should be user input
    // and we can use dimo api to plan routes to other services like gas or tire pump
    directionsService
      .route({
        origin: position,
        destination: destinationInput, // Using the user input as the destination
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      })
      .catch((error) => {
        console.error("Error fetching directions:", error);
      });
  }, [directionsService, directionsRenderer, destinationInput]);

  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) return null;
  return (
    <div className="directions">
      <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Total Duration: {leg.duration?.text}</p>
      <h2>Routes Available:</h2>
      <ul>
        {routes.map((route, index) => (
          <li key={route.summary}>
            <button onClick={() => setRouteIndex(index)}>
              {route.summary}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


const Logout = () => {
  const handleOnClick = () => {
    Cookies.remove("user");
    Cookies.remove("fetchAuth")
    Cookies.remove("tokenID")
    Cookies.remove("access")

  };
  return (
    <div className="LogoutCSS">
      <button onClick={handleOnClick}>Log Out</button>
    </div>
  );
};

function splitString(input: string): string {
  // Find the index of '=' and '&'
  const startIndex = input.indexOf("=") + 1;
  const endIndex = input.indexOf("&");

  // Extract the substring between '=' and '&'
  if (startIndex > 0 && endIndex > startIndex) {
    return input.substring(startIndex, endIndex);
  } else {
    return ""; // Return empty string if format is incorrect
  }
}

// Check Cookies for dimo log in
const readCookies = (): boolean => {
  const fetchAuth = Cookies.get("fetchAuth")
  if (fetchAuth !== undefined) {
    if (fetchAuth == "true") {
      return true
    }
  }
    const user = Cookies.get("user");
    const accessToken = Cookies.get("access")
    //const tokenID = Cookies.get("tokenID")
    console.log("Access from readCookies: '"+(accessToken as string)+"'")
    console.log("User from readCookies: "+user)
    //console.log("Token ID from readCookies: '"+ (tokenID as string)+"'")
    if ((user == undefined) || (accessToken == undefined)) {
      return false
    }
    if ((user == '') || (accessToken == '')) {
      return false
    }
    return true
};

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}
//get access code for api calls
function getAccessCode(){
  var accessToken = ""
  const userUrl = window.location.href;
  const code = splitString(userUrl);
  const data = new URLSearchParams({
    client_id: client_id,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: "http://localhost:3000/",
    }
  );


  var formBody = [];
  var key = encodeURIComponent("client_id")
  var value = encodeURIComponent(client_id)
  formBody.push(key+"="+value)
  key = encodeURIComponent("grant_type")
  value = encodeURIComponent("authorization_code")
  formBody.push(key+"="+value)
  key = encodeURIComponent("code")
  value = encodeURIComponent(code)
  formBody.push(key+"="+value)
  key = encodeURIComponent("redirect_uri")
  value = encodeURIComponent("http://localhost:3000")
  formBody.push(key+"="+value)
  
  const formB = formBody.join("&");  

  console.log("found user_url: "+ userUrl+" code: "+code+" data: "+data)
  console.log("running fetch for access code NOT ACCESSING")
  fetch("https://auth.dev.dimo.zone/token", {
    method: "POST",
    body: formB,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
  }).then((response) => {
        console.log("IN RESPONSE")
        console.log(response)
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        accessToken = data.access_token;
        console.log("Access Token:", accessToken);
        Cookies.set("access", accessToken)
        Cookies.set("user", "authPassed")
        Cookies.set("tokenID", data.id_token)
        return accessToken
      })
      .catch((error) => {
        console.log("ERROR! ERROR!")
        console.error("Error:", error);
      });

       delay(15000)
  console.log("After fetch")
}





/*
function getTokenID(): string{
  var tokenID = ""
    const userUrl = window.location.href;
    const code = splitString(userUrl);
    const data = new URLSearchParams({
      client_id: process.env.REACT_APP_CLIENT_ID as string,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:3000/",
    });

    fetch("https://auth.dev.dimo.zone/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
       tokenID = data.id_token;
        console.log("Token ID:", tokenID);
      })
      .catch((error) => {
        console.error("Error:", error);
      });


   return tokenID;  




   
}*/

