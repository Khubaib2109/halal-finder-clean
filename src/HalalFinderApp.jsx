import { useState } from "react";
import axios from "axios";
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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Halal Finder</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          placeholder="Enter a location (e.g. Sydney)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {results.length > 0 ? (
        <>
          <MapContainer center={[results[0].lat, results[0].lng]} zoom={13} style={{ height: "400px", borderRadius: "1rem", marginBottom: "1.5rem" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {results.map((place, i) => (
              <Marker key={i} position={[place.lat, place.lng]}>
                <Popup>
                  <strong>{place.name}</strong>
                  <br />
                  {place.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div style={{ display: "grid", gap: "1rem" }}>
            {results.map((place, i) => (
              <div key={i} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "600" }}>{place.name}</h2>
                <p style={{ color: "#555" }}>{place.address}</p>
                <p style={{ fontSize: "0.9rem" }}>⭐ {place.rating}</p>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                  {place.halalMentions.map((text, j) => (
                    <li key={j}>"{text}"</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : loading ? null : (
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}>No results yet.</p>
      )}
    </div>
  );
}
