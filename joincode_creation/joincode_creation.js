import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "../../firebase";
import { getRoomsByTeacher } from "../../roomFunctions";
import "./joincode_creation.css";

const JoinCodeCreation = ({ navigateToClassroomTeacher }) => {
  const [joinCode, setJoinCode] = useState("");
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [showRoomNameModal, setShowRoomNameModal] = useState(false);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const rooms = await getRoomsByTeacher(currentUser.uid);
        setTeacherClasses(rooms);
      } catch (error) {
        console.error("Error fetching teacher's classes:", error.message);
      }
    };

    fetchTeacherClasses();
  }, []);

  const generateJoinCode = () => {
    const newJoinCode = Array.from({ length: 6 }, () =>
      Math.random().toString(36).charAt(2).toUpperCase()
    ).join("");
    setJoinCode(newJoinCode);
    setShowRoomNameModal(true);
  };

  const handleSaveRoom = async () => {
    if (!roomName.trim()) {
      alert("Please enter a room name.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("No user is logged in. Please log in and try again.");
      return;
    }

    try {
      await setDoc(doc(db, "rooms", joinCode), {
        joinCode: joinCode,
        teacherId: currentUser.uid,
        teacherEmail: currentUser.email,
        roomName: roomName,
        createdAt: new Date().toISOString(),
        students: [],
      });

      setTeacherClasses((prevClasses) => [
        ...prevClasses,
        { id: joinCode, roomName: roomName, createdAt: new Date().toISOString() },
      ]);

      console.log("Room created and saved to Firestore:", joinCode);
      setShowRoomNameModal(false);
      setRoomName("");
    } catch (error) {
      console.error("Error saving room to Firestore:", error.message);
      alert("Failed to save room. Please try again.");
    }
  };

  return (
    <div className="join-code-creation-container">
      <div className="header">
        <h1 className="title">Welcome to the Classroom</h1>
        <p className="description">Create a join code for your class</p>
      </div>

      <button className="generate-button" onClick={generateJoinCode}>
        Generate Join Code
      </button>

      {showRoomNameModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-title">Enter Room Name</h3>
            <input
              className="modal-input"
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-button" onClick={handleSaveRoom}>
                Save
              </button>
              <button
                className="modal-button cancel"
                onClick={() => setShowRoomNameModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="your-classes-list">
        <h2 className="classes-title">Your Classes</h2>
        <ul className="classes-list">
          {teacherClasses.map((room) => (
            <li key={room.id} className="class-item">
              <button
                className="class-button"
                onClick={() => navigateToClassroomTeacher(room.id)}
              >
                {room.roomName}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JoinCodeCreation;
