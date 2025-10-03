// RequestedProperty.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

// ✅ Format document keys
const formatDocType = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

export default function RequestedProperty() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFlatId, setExpandedFlatId] = useState(null);

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "registeredFlats"));
      const flatsData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // ✅ Only keep flats with status = pending
      const pendingFlats = flatsData.filter((flat) => flat.status === "pending");

      setFlats(pendingFlats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching flats: ", error);
      setLoading(false);
    }
  };

  const toggleStatus = async (flat) => {
    const newStatus = flat.status === "pending" ? "approved" : "pending";
    try {
      await updateDoc(doc(db, "registeredFlats", flat.id), {
        status: newStatus,
      });

      // ✅ If approved, remove from list immediately
      setFlats((prev) =>
        prev.filter((f) => f.id !== flat.id)
      );
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (flats.length === 0) return <p>No pending requests.</p>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
      {flats.map((flat) => (
        <div
          key={flat.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "300px",
            padding: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          {/* Thumbnail */}
          <img
            src={flat.thumbnailURL}
            alt={flat.title}
            style={{
              width: "100%",
              height: "180px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />

          {/* Title + Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>{flat.title}</h3>
            
            
            <input
            
              type="checkbox"
              checked={flat.status === "approved"}
              onChange={() => toggleStatus(flat)}
            />
          </div>

          {/* Detail Button */}
          <button
            onClick={() =>
              setExpandedFlatId(expandedFlatId === flat.id ? null : flat.id)
            }
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Detail
          </button>

          {/* Expanded Table */}
          {expandedFlatId === flat.id && (
            <table
              style={{
                width: "100%",
                marginTop: "10px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "5px" }}>
                    Field
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "5px" }}>
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Title", value: flat.title },
                  { label: "Location", value: flat.address },
                  { label: "Address", value: flat.faddress },
                  { label: "Flat Name", value: flat.flatName },
                  { label: "Floor Name", value: flat.floorName },
                  { label: "Tower Name", value: flat.towerName },
                  { label: "Type", value: flat.type },
                ].map((field, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                      {field.label}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                      {field.value || "-"}
                    </td>
                  </tr>
                ))}

                {/* Owners */}
                {flat.owners?.map((owner, idx) => (
                  <tr key={`owner-${idx}`}>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                      Owner {idx + 1}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                      {owner.name} - {owner.aadhar}
                    </td>
                  </tr>
                ))}

                {/* Documents */}
                {flat.documents &&
                  Object.entries(flat.documents).map(([docType, url]) => (
                    <tr key={docType}>
                      <td
                        style={{ border: "1px solid #ccc", padding: "5px" }}
                      >
                        {formatDocType(docType)}
                      </td>
                      <td
                        style={{ border: "1px solid #ccc", padding: "5px" }}
                      >
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              backgroundColor: "#28a745",
                              color: "#fff",
                              borderRadius: "4px",
                              textDecoration: "none",
                            }}
                          >
                            Download
                          </a>
                        ) : (
                          "Not available"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
