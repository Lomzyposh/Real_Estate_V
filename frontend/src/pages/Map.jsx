import React from "react";
import MapView from "../components/MapView";
import { useContext } from "react";
import { useProperties } from "../contexts/PropertiesContext";

export default function Map() {
    const { properties } = useProperties();

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Explore on Map</h2>
            <MapView properties={properties} zoomThreshold={14} dark={false} />
          
        </div>
    );
}
