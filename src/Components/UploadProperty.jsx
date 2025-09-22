// UploadProperty.jsx
import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadProperty({ onUploadSuccess }) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("New Project");
  const [rate, setRate] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [otherPhotos, setOtherPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Towers structure: [{ name: "Tower A", floors: [{ floorNumber: 1, flats: ["101","102"] }] }]
  const [towers, setTowers] = useState([]);
  const [towerCount, setTowerCount] = useState(0);

  const handleThumbnailChange = (e) => setThumbnail(e.target.files[0]);
  const handleOtherPhotosChange = (e) => setOtherPhotos([...e.target.files]);

  const handleTowerCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setTowerCount(count);

    // Resize towers array
    const updatedTowers = Array.from({ length: count }, (_, i) => {
      return towers[i] || { name: `Tower ${i + 1}`, floors: [] };
    });
    setTowers(updatedTowers);
  };

  const handleTowerNameChange = (index, value) => {
    const updated = [...towers];
    updated[index].name = value;
    setTowers(updated);
  };

  const handleFloorCountChange = (towerIndex, count) => {
    const updated = [...towers];
    updated[towerIndex].floors = Array.from({ length: count }, (_, i) => {
      return updated[towerIndex].floors[i] || { floorNumber: i + 1, flats: [] };
    });
    setTowers(updated);
  };

  const handleFlatsChange = (towerIndex, floorIndex, flatsStr) => {
    const updated = [...towers];
    updated[towerIndex].floors[floorIndex].flats = flatsStr
      .split(",")
      .map((f) => f.trim());
    setTowers(updated);
  };

  const handleUpload = async () => {
    if (!title || !address || !city || !state || !pincode || !description || !thumbnail || !rate) {
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
        location: { address, city, state, pincode },
        description,
        category,
        rate,
        towers,
        thumbnailURL,
        otherPhotoURLs,
        createdAt: new Date(),
      });

      alert("Property uploaded successfully!");
      setTitle("");
      setAddress("");
      setCity("");
      setState("");
      setPincode("");
      setDescription("");
      setCategory("New Project");
      setRate("");
      setThumbnail(null);
      setOtherPhotos([]);
      setTowerCount(0);
      setTowers([]);

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Error uploading property:", error);
      alert("Failed to upload property!");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto 40px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Upload New Property</h2>

      <input
        type="text"
        placeholder="Property Name / Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", margin: "10px 0", width: "100%" }}
      />

      <h4>Location:</h4>
      <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ display: "block", margin: "10px 0", width: "100%" }} />
      <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ display: "block", margin: "10px 0", width: "100%" }} />
      <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={{ display: "block", margin: "10px 0", width: "100%" }} />
      <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ display: "block", margin: "10px 0", width: "100%" }} />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", margin: "10px 0", width: "100%", minHeight: "100px" }}
      />

      <label>Category:</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ display: "block", margin: "10px 0", width: "100%" }}>
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

      {/* Tower Section */}
      <h4>Towers:</h4>
      <input
        type="number"
        placeholder="Number of Towers"
        value={towerCount}
        onChange={handleTowerCountChange}
        style={{ display: "block", margin: "10px 0", width: "100%" }}
      />

      {towers.map((tower, towerIndex) => (
        <div key={towerIndex} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "6px" }}>
          <input
            type="text"
            placeholder={`Tower ${towerIndex + 1} Name`}
            value={tower.name}
            onChange={(e) => handleTowerNameChange(towerIndex, e.target.value)}
            style={{ display: "block", margin: "10px 0", width: "100%" }}
          />
          <input
            type="number"
            placeholder="Number of Floors"
            value={tower.floors.length}
            onChange={(e) => handleFloorCountChange(towerIndex, parseInt(e.target.value) || 0)}
            style={{ display: "block", margin: "10px 0", width: "100%" }}
          />

          {tower.floors.map((floor, floorIndex) => (
            <div key={floorIndex} style={{ marginLeft: "15px", padding: "5px", borderLeft: "2px solid #aaa" }}>
              <label>Floor {floor.floorNumber} - Flats (comma separated):</label>
              <input
                type="text"
                placeholder="e.g. 101, 102, 103"
                value={floor.flats.join(", ")}
                onChange={(e) => handleFlatsChange(towerIndex, floorIndex, e.target.value)}
                style={{ display: "block", margin: "5px 0", width: "100%" }}
              />
            </div>
          ))}
        </div>
      ))}

      <label>Main Thumbnail:</label>
      <input type="file" onChange={handleThumbnailChange} accept="image/*" style={{ marginBottom: "10px" }} />

      <label>Other Photos:</label>
      <input type="file" multiple onChange={handleOtherPhotosChange} accept="image/*" style={{ marginBottom: "10px" }} />

      <button onClick={handleUpload} disabled={loading} style={{ marginTop: "15px", padding: "10px 20px" }}>
        {loading ? "Uploading..." : "Upload Property"}
      </button>
    </div>
  );
}
