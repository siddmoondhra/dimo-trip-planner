"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  APIProvider,
  Map,
} from "@vis.gl/react-google-maps";
import { ApolloWrapper } from './apollo-client'; 
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation
} from "react-router-dom";
import "./styles.css";
import Cookies from "js-cookie";
import Location from '../components/data/Location'
import Directions from "../components/Directions"
import getUserFuelLevel from '../components/data/FuelLevel'





var client_id = "0x1E0B0e5Aa4ABf2D2927639933d1324B6804538c3"

export default function TripPlanner() {
  
  /* 
  Auth Flow
  */

  useEffect(() => {
    console.log("In USEEFFECT")
    if (isAuthNeeded()) {
      console.log("in first section")
      Cookies.set("fetchAuth", "true")


      console.log("Cookies not found, going to FETCH")
      var base_url = "https://auth.dimo.zone/auth"
      var redirect_uri = "http://localhost:3000/"
      var extra_tail = "scope=openid email&response_type=code"
      var url = base_url+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&"+extra_tail
      console.log("FETCHing from "+url)
      
      window.location.href = url
   
      
    } else {
      var accessToken = getAccessTokenFromCookie()
      console.log("access token from getacctokenfromcookie: " + accessToken)

      if (accessToken == "UNKNOWN") {
        console.log("in second section")
        
        console.log("Found cookies! getting access code")
        getUserIDs()
        
      } else {
        console.log("in third section") 

        ///const accessToken = Cookies.get('accessToken'); 
        getUserInfo()
      }
    }
  }, []);

  /* 
  Variables
  */
  //console.log("MAIN PAGE");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // State to store user input for destination
  const [destinationInput, setDestinationInput] = useState<string>("");
  // State to store the submitted input
  const [submittedInput, setSubmittedInput] = useState<string>("");

  const position = {
    lat: 37.2063119,
    lng: -121.8620807,
  };
  const zoom = 10;

  // Function to handle changes in the input
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDestinationInput(event.target.value);
  };

  // Function to handle form submission
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedInput(destinationInput); // Update submitted input
  };

  //console.log("about to main return");
  return (
    <div style={{ height: "65vh", width: "100%", position: "relative" }}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}>
        <Map defaultCenter={position} defaultZoom={zoom} mapId={process.env.NEXT_PUBLIC_MAP_ID}>
          <Directions origin="7089 Royal Ridge Dr, San Jose, CA" destination={submittedInput} />
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


const Logout = () => {
  const handleOnClick = () => {
    Cookies.remove("fetchAuth")
    Cookies.remove("accessToken")

    //location.reload()

  };
  return (
    <div className="LogoutCSS">
      <button onClick={handleOnClick}>Log Out</button>
    </div>
  );
};

// Check Cookies for dimo log in
const isAuthNeeded = (): boolean => {
  console.log("checking for auth")
  const fetchAuth = Cookies.get("fetchAuth")
  if (fetchAuth !== undefined) {
    if (fetchAuth == "true") {
      return false
    }
  }
  return true
};

const getAccessTokenFromCookie = (): string => {
  const accessToken = Cookies.get("accessToken")
  if (accessToken !== undefined) {
      return accessToken
  }
  return "UNKNOWN"
}



function getUserIDs(): void {
  console.log("in get user ids")
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get("code");
  console.log("got code, myParam = "+myParam)

  interface TokenResponse {
    access_token: string;
    id_token: number;
    expires_in: number;
    refresh_token?: string;
  }

  if (myParam) {
    fetch('https://auth.dimo.zone/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'client_id': '0x1E0B0e5Aa4ABf2D2927639933d1324B6804538c3',
        'grant_type': 'authorization_code',
        'code': myParam,
        'redirect_uri': 'http://localhost:3000/',

      
      })
    })
      .then((response) => {
        console.log("GOT RESPONSE");
        return response.json();
      })
      .then((data: TokenResponse) => { 
        console.log("GOT DATA");
        console.log(data);
        const accessToken = data.access_token;
        const tokenId = data.id_token
        console.log("Access Token", accessToken);
        Cookies.set("accessToken", accessToken)
        ///Cookies.set("tokenId", (tokenId as unknown as string))
        console.log("going to get user info")
        getUserInfo()
      })
      .catch((error) => console.error('Error:', error));
  }
}



function getUserInfo(): void{
  const accessToken = Cookies.get("accessToken");
  fetch('https://users-api.dimo.zone/v1/user',{
    method: 'get',
    headers: {
      'Authorization': `Bearer ${accessToken}`,

    }
  })
  .then((response) => {
    console.log("GOT RESPONSE FROM USERS API");
    return response.json();
  }).then((data) => {
    console.log(data);
    if (data.web3 && data.web3.address) {
      console.log("getting token id")
      getVehicleTokenId(data.web3.address);
    }
  }).catch((error) => console.error('Error:', error));

}

function getVehicleTokenId(wallet: string): void {
  console.log("got to getVehicleTokenId");

  fetch('https://identity-api.dimo.zone/query', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        vehicles(first: 1, filterBy: {owner: "${wallet}"}) {
          nodes {
            tokenId
          }
        }
      }`
    })
  })
  .then((response) => {
    console.log("GOT RESPONSE FROM IDENTITY API");
    return response.json();
  })
  .then((data) => {
    console.log(data);

    // Safely checking for the presence of vehicles and nodes
    const vehicles = data?.data?.vehicles;
    if (vehicles && vehicles.nodes && vehicles.nodes.length > 0) {
      const tokenId = vehicles.nodes[0].tokenId;
      console.log("Extracted tokenId:", tokenId);
      // Pass tokenId to another function
      getPrivToken(tokenId)
    } else {
      console.error("Vehicles or nodes not found in the response.");
    }
  })
  .catch((error) => console.error('Error:', error));
}


function getPrivToken(tokenId: number) {
  const accessToken = Cookies.get("accessToken");
  console.log("Token ID inside getPrivToken:", tokenId); // Log tokenId for debugging
  console.log("tokenid type: "+ typeof(tokenId))
  if (!accessToken || !tokenId) {
    console.error('Access Token or Token ID is missing or invalid');
    return;
  }

  fetch('https://token-exchange-api.dimo.zone/v1/tokens/exchange', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json', // Ensure correct Content-Type
    },
    body: JSON.stringify({
      nftContractAddress: '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF',
      privileges: [1,2,3,4], // Example: 3 for current location
      tokenId: tokenId // Ensure this is sent as an integer
    })
  })
  .then((response) => {
    console.log("GOT RESPONSE FROM TOKEN EXCHANGE");
    if (!response.ok) {
      console.log(response)
    }
    return response.json();
  })
  .then((data) => {
    console.log(data);
    const privToken = data.token
    console.log('privToken: '+privToken)
    Location(tokenId,privToken)
    ///getUserFuelLevel(tokenId, privToken)
  })
  .catch((error) => console.error('Error:', error));
}
