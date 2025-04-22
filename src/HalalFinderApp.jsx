
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function HalalFinderApp() {
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://halal-finder-app.onrender.com/halal-places", {
        params: { location },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Halal Finder</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter a location (e.g. Sydney)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {results.length > 0 ? (
        <>
          <MapContainer center={[results[0].lat, results[0].lng]} zoom={13} className="h-96 w-full mb-6 rounded-xl">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            {results.map((place, i) => (
              <Marker key={i} position={[place.lat, place.lng]}>
                <Popup>
                  <strong>{place.name}</strong>
                  <br />{place.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="grid gap-4">
            {results.map((place, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold">{place.name}</h2>
                  <p className="text-sm text-gray-600">{place.address}</p>
                  <p className="text-sm">⭐ {place.rating}</p>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {place.halalMentions.map((text, j) => (
                      <li key={j}>&ldquo;{text}&rdquo;</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : loading ? null : (
        <p className="text-center text-sm text-gray-500">No results yet.</p>
      )}
    </div>
  );
}
