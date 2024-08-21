"use client"

import React from "react";
import { useQuery, gql } from "@apollo/client";

const getUserLocation = gql`
  query getUserLocation($tokenId: String!, $startDate: String!, $endDate: String!, $interval: String!) {
    signals(tokenId: $tokenId, from: $startDate, to: $endDate, interval: $interval) {
      currentLocationLongitude
      currentLocationLatitude
    }
  }
`;
// Define the props types for the Location component
interface LocationProps {
    tokenId: string;
    startDate: string;
    endDate: string;
    interval: string;
  }

  export default function Location({ tokenId, startDate, endDate, interval }: LocationProps) {
    const { data, loading, error } = useQuery(getUserLocation, {
        variables: {
            tokenId: tokenId,
            startDate: startDate,
            endDate: endDate,
            interval: interval,
        },
    });
    if (loading) return "Loading...";
    if (error) return <pre>{error.message}</pre>

    const { latitude, longitude } = data.userLocation;

  return (
    <div>
      <p>Latitude: {latitude}</p>
      <p>Longitude: {longitude}</p>
    </div>
  );

}   