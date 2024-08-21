"use client"

import React, { useEffect } from "react"
import { Loader } from '@googlemaps/js-api-loader'
export function Map(){

    const mapRef = React.useRef<HTMLDivElement>(null) 

    useEffect(()=>{
        const initMap = async () => {

            //load api key and version refresh rate
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string, 
                version: "weekly",
                libraries: ["places"]
            }); 
             
            //import library for maps
            const { Map } = await loader.importLibrary('maps');

            //init a marker
            const { Marker } = await loader.importLibrary('marker') as google.maps.MarkerLibrary;
            
            //the position the map will be centered on, will make this user's current location soon
            //this is currently my home, CHANGE LOCATION
            const position = {
                lat: 37.2063119,
                lng: -121.8620807
            }

            const mapOptions: google.maps.MapOptions = {
                center: position,
                zoom: 17,
                //GENERATE NEW MAP ID
                mapId: 'MY_NEXTJS_MAPID'
            }

            //set up map
            const map = new Map(mapRef.current as HTMLDivElement, mapOptions);

            //put up a marker
            const marker  = new Marker({
                map: map,
                position: position
            })
        }
        initMap();
    },[])

    return (
        <div style = {{height: '600px'}} ref={mapRef}/>
    )
}