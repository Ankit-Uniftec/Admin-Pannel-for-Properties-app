// AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPanel() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("New Project");
  const [rate, setRate] = useState("");
  const [type, setType] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [otherPhotos, setOtherPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleOtherPhotosChange = (e) => {
    setOtherPhotos([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!title || !location || !description || !thumbnail || !rate || !type) {
      alert("Please fill all fields and select a thumbnail!");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload thumbnail
      const thumbRef = ref(storage, `properties/${Date.now()}-thumbnail-${thumbnail.name}`);
      await uploadBytes(thumbRef, thumbnail);
      const thumbnailURL = await getDownloadURL(thumbRef);

      // 2. Upload other photos
      const otherPhotoURLs = [];
      for (let file of otherPhotos) {
        const photoRef = ref(storage, `properties/${Date.now()}-${file.name}`);
        await uploadBytes(photoRef, file);
        const photoURL = await getDownloadURL(photoRef);
        otherPhotoURLs.push(photoURL);
      }

      // 3. Save property data in Firestore
      await addDoc(collection(db, "properties"), {
        title,
        location,
        description,
        category,
        rate, // saved as string
        type,
        thumbnailURL,
        otherPhotoURLs,
        createdAt: new Date(),
      });

      alert("Property uploaded successfully!");
      setTitle("");
      setLocation("");
      setDescription("");
      setCategory("New Project");
      setRate("");
      setType("");
      setThumbnail(null);
      setOtherPhotos([]);
    } catch (error) {
      console.error("Error uploading property:", error);
      alert("Failed to upload property!");
    }

    setLoading(false);
  };

  // Fetch properties from Firestore
  const fetchProperties = async () => {
    try {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const propertiesData = [];

      querySnapshot.forEach((doc) => {
        propertiesData.push({
          id: doc.id,
          ...doc.data(),
        });
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
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h1>Admin Panel</h1>

      {/* Upload Section */}
      <div
        style={{
          padding: "20px",
          maxWidth: "600px",
          margin: "0 auto 40px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Upload New Property</h2>
        <input
          type="text"
          placeholder="Property Name / Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <input
          type="text"
          placeholder="Property Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            display: "block",
            margin: "10px 0",
            width: "100%",
            minHeight: "100px",
          }}
        />

        <label>Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        >
          <option value="New Project">New Project</option>
          <option value="Luxury Project">Luxury Project</option>
        </select>

        <input
          type="text"
          placeholder="Rate (e.g. $2000 per sq ft)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <input
          type="text"
          placeholder="Type (e.g. Apartment, Villa)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />

        <label>Main Thumbnail:</label>
        <input
          type="file"
          onChange={handleThumbnailChange}
          accept="image/*"
          style={{ marginBottom: "10px" }}
        />

        <label>Other Photos:</label>
        <input
          type="file"
          multiple
          onChange={handleOtherPhotosChange}
          accept="image/*"
          style={{ marginBottom: "10px" }}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{ marginTop: "15px", padding: "10px 20px" }}
        >
          {loading ? "Uploading..." : "Upload Property"}
        </button>
      </div>

      {/* Display Properties Section */}
      <div>
        <h2>Uploaded Properties</h2>
        {fetchLoading ? (
          <p>Loading properties...</p>
        ) : properties.length === 0 ? (
          <p>No properties found.</p>
        ) : (
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
                  padding: "15px",
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
                      borderRadius: "4px",
                      marginBottom: "10px",
                    }}
                  />
                )}
                <h3>{property.title}</h3>
                <p>
                  <strong>Location:</strong> {property.location}
                </p>
                <p>
                  <strong>Description:</strong> {property.description}
                </p>
                <p>
                  <strong>Category:</strong> {property.category}
                </p>
                <p>
                  <strong>Rate:</strong> {property.rate}
                </p>
                <p>
                  <strong>Type:</strong> {property.type}
                </p>

                {property.otherPhotoURLs &&
                  property.otherPhotoURLs.length > 0 && (
                    <div>
                      <h4>Other Photos:</h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        {property.otherPhotoURLs.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${property.title} - ${index + 1}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
