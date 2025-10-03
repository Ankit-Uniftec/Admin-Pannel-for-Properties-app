import React, { useState } from "react";
import ListedProperty from "./ListedProperty";
import UploadProperty from "./UploadProperty";
import RequestedProperty from "./RequestedProperty"; 

const Sidemenu = () => {
  const [active, setActive] = useState("Null");

  // Map menu names to components
  const components = {
    "UploadProperty": <UploadProperty/>,
    "ListedProperty": <ListedProperty />,
    "RequestedProperty": <RequestedProperty/>,
     
    
  };

  const menuItems = Object.keys(components);

  return (
    <div style={{ display: "flex", height: "100vh" ,}}>
      {/* Left Menu */}
      <div style={{ width: "250px", background: "#35B79F", color: "white" }}>
        {menuItems.map((item) => (
          <div
            key={item}
            onClick={() => setActive(item)}
            style={{
              padding: "15px",
              cursor: "pointer",
              background: active === item ? "black" : "#35B79F",
              color: active === item ? "white" : "black",
              borderBottom: "1px solid white",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Right Side - Show selected calculator */}
      <div style={{ flex: 1, padding: "20px" }}>
        
        {components[active]}
      </div>
    </div>
  );
};

export default Sidemenu;
