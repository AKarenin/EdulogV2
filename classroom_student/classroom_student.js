import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRoomsByStudent,
  addStudentToRoom,
  checkRoomExists,
  getRoomDetails,
} from "../../roomFunctions";
import { auth } from "../../firebase";
import "./classroom_student.css";

const ClassroomStudent = ({ navigateToChatroom }) => {
  const [classes, setClasses] = useState([]);
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);
  const [newJoinCode, setNewJoinCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch the list of classes the student is enrolled in
  useEffect(() => {
    const fetchClasses = async () => {
      const studentId = auth.currentUser?.uid;
      if (!studentId) return;

      try {
        const rooms = await getRoomsByStudent(studentId);
        console.log("Fetched classes:", rooms); // Debugging log
        setClasses(rooms);
      } catch (error) {
        console.error("Error fetching classes:", error.message);
        setError("Failed to fetch classes. Please try again.");
      }
    };

    fetchClasses();
  }, []);

  // Handle joining a new class
  const handleJoinNewClass = async () => {
    if (!newJoinCode.trim()) {
      setError("Please enter a valid join code.");
      return;
    }

    const studentId = auth.currentUser?.uid;
    const studentName = auth.currentUser?.displayName || "Anonymous";
    const studentEmail = auth.currentUser?.email || "";

    if (!studentId) {
      setError("User not authenticated. Please log in.");
      return;
    }

    try {
      // Check if the room exists
      const roomExists = await checkRoomExists(newJoinCode);
      if (!roomExists) {
        setError("Invalid join code. Please check the code and try again.");
        return;
      }

      // Add the student to the room
      await addStudentToRoom(newJoinCode, studentId, studentName, studentEmail);

      // Fetch the updated room details
      const roomDetails = await getRoomDetails(newJoinCode);
      console.log("Room details after joining:", roomDetails); // Debugging log
      setClasses((prevClasses) => [...prevClasses, roomDetails]); // Update local state
      setNewJoinCode(""); // Clear the input
      setShowJoinClassModal(false); // Close the modal
      setError(""); // Clear any previous errors

      // Navigate to the chatroom
      navigateToChatroom(newJoinCode);
    } catch (error) {
      console.error("Error joining class:", error.message);
      setError("Failed to join class. Please check the join code and try again.");
    }
  };

  // Handle clicking on a class to navigate to the chatroom
  const handleClassClick = (joinCode) => {
    if (!joinCode) {
      console.error("Join code is undefined."); // Debugging log
      setError("Invalid room. Please try again.");
      return;
    }

    console.log("Navigating to chatroom with joinCode:", joinCode); // Debugging log
    navigateToChatroom(joinCode);
  };

  return (
    <div className="classroom-student">
      <div className="header">
        <h1>Welcome to Your Classroom</h1>
      </div>

      {/* Display error messages */}
      {error && <div className="error-message">{error}</div>}

      <div className="class-list-container">
        <h3 className="class-list-title">Your Classes</h3>
        <ul className="class-list">
          {classes.map((room) => (
            <li key={room.id} className="class-item">
              <button
                className="class-button"
                onClick={() => handleClassClick(room.id)}
              >
                {room.roomName}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="join-new-class-button"
          onClick={() => setShowJoinClassModal(true)}
        >
          Join New Class
        </button>
      </div>

      {/* Join New Class Modal */}
      {showJoinClassModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-title">Join a New Class</h3>
            <input
              className="modal-input"
              type="text"
              placeholder="Enter join code"
              value={newJoinCode}
              onChange={(e) => setNewJoinCode(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-button" onClick={handleJoinNewClass}>
                Join
              </button>
              <button className="modal-button cancel" onClick={() => setShowJoinClassModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomStudent;