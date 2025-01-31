import React, { useState, useEffect } from "react";
import Chatroom from "../chatroom/chatroom";
import ClassroomStudent from "../classroom_student/classroom_student";
import "./merged_page.css"; // Add your styles here

const MergedPage = () => {
  const [currentClass, setCurrentClass] = useState(null); // Tracks the selected class

  const handleClassSelection = (classId) => {
    setCurrentClass(classId); // Update the selected class
  };

  return (
    <div className="merged-page-container">
      {/* Left Section: Classroom Student */}
      <div className="left-section">
        <ClassroomStudent navigateToChatroom={handleClassSelection} />
      </div>

      {/* Right Section: Chatroom */}
      <div className="right-section">
        {currentClass ? (
          <Chatroom joinCode={currentClass} />
        ) : (
          <div className="placeholder">Select a class to start chatting.</div>
        )}
      </div>
    </div>
  );
};

export default MergedPage;
