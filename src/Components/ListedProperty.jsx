// ListedProperty.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function ListedProperty({ refresh }) {
  const [properties, setProperties] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const propertiesData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // ❌ Exclude properties that have a "status" field
        if (!("status" in data)) {
          propertiesData.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setProperties(propertiesData);
      setFetchLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [refresh]); // refetch when refresh changes

  if (fetchLoading) return <p>Loading properties...</p>;
  if (properties.length === 0) return <p>No properties found.</p>;

  return (
    <div>
      <h2>Uploaded Properties</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {properties.map((property) => (
          <div
            key={property.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {property.thumbnailURL && (
              <img
                src={property.thumbnailURL}
                alt={property.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              />
            )}
            <h3 style={{ margin: "5px 0" }}>{property.title}</h3>
            <p style={{ color: "#555" }}>
              <strong>Location:</strong> {property.location?.address || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
