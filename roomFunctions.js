import {
  doc,
  setDoc,
  getDoc,
  collection,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Creates a new room with the given join code, teacher ID, and room name.
 * @param {string} joinCode - The unique join code for the room.
 * @param {string} teacherId - The ID of the teacher creating the room.
 * @param {string} roomName - The name of the room.
 */
export const createRoom = async (joinCode, teacherId, roomName) => {
  try {
    const roomRef = doc(db, "rooms", joinCode);

    // Check if the room already exists
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      throw new Error("Room with this join code already exists.");
    }

    // Create the room with an empty students array and room name
    await setDoc(roomRef, {
      teacherId,
      roomName,
      createdAt: new Date().toISOString(),
      students: [],
    });

    console.log("Room created successfully:", joinCode);
  } catch (error) {
    console.error("Error creating room:", error.message);
    throw error;
  }
};

/**
 * Adds a student to a room.
 * @param {string} joinCode - The join code of the room.
 * @param {string} studentId - The ID of the student joining the room.
 * @param {string} studentName - The name of the student.
 * @param {string} studentEmail - The email of the student.
 */
export const addStudentToRoom = async (joinCode, studentId, studentName, studentEmail) => {
  try {
    const roomRef = doc(db, "rooms", joinCode);

    // Check if the room exists
    const roomDoc = await getDoc(roomRef);
    if (!roomDoc.exists()) {
      throw new Error("Room not found.");
    }

    // Add the student to the room's students array
    await updateDoc(roomRef, {
      students: arrayUnion({ id: studentId, name: studentName, email: studentEmail }),
    });

    console.log("Student added to room:", joinCode);
  } catch (error) {
    console.error("Error adding student to room:", error.message);
    throw error;
  }
};

/**
 * Fetches the details of a room by its join code.
 * @param {string} joinCode - The join code of the room.
 * @returns {Promise<Object>} - The room data.
 */
export const getRoomDetails = async (joinCode) => {
  try {
    const roomRef = doc(db, "rooms", joinCode);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      throw new Error("Room not found.");
    }

    return roomDoc.data();
  } catch (error) {
    console.error("Error fetching room details:", error.message);
    throw error;
  }
};

/**
 * Checks if a room exists by its join code.
 * @param {string} joinCode - The join code of the room.
 * @returns {Promise<boolean>} - True if the room exists, false otherwise.
 */
export const checkRoomExists = async (joinCode) => {
  try {
    const roomRef = doc(db, "rooms", joinCode);
    const roomDoc = await getDoc(roomRef);
    return roomDoc.exists();
  } catch (error) {
    console.error("Error checking if room exists:", error.message);
    throw error;
  }
};

/**
 * Fetches all rooms for a specific teacher.
 * @param {string} teacherId - The ID of the teacher.
 * @returns {Promise<Array>} - A list of rooms created by the teacher.
 */
export const getRoomsByTeacher = async (teacherId) => {
  try {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);

    const rooms = [];
    querySnapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() });
    });

    return rooms;
  } catch (error) {
    console.error("Error fetching rooms by teacher:", error.message);
    throw error;
  }
};

/**
 * Fetches all rooms a student is enrolled in.
 * @param {string} studentId - The ID of the student.
 * @returns {Promise<Array>} - A list of rooms the student is enrolled in.
 */
export const getRoomsByStudent = async (studentId) => {
  try {
    const roomsRef = collection(db, "rooms");
    const querySnapshot = await getDocs(roomsRef);

    const rooms = [];
    querySnapshot.forEach((doc) => {
      const roomData = doc.data();
      if (roomData.students?.some((student) => student.id === studentId)) {
        rooms.push({ id: doc.id, ...roomData });
      }
    });

    return rooms;
  } catch (error) {
    console.error("Error fetching rooms by student:", error.message);
    throw error;
  }
};

/**
 * Fetches messages for a specific student in a room.
 * @param {string} joinCode - The join code of the room.
 * @param {string} studentId - The ID of the student.
 * @returns {Promise<Array>} - A list of messages for the student.
 */
export const getStudentMessages = async (joinCode, studentId) => {
  try {
    const messagesRef = collection(db, "rooms", joinCode, "students", studentId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    return messages;
  } catch (error) {
    console.error(`Error fetching messages for student ${studentId}:`, error.message);
    throw error;
  }
};

/**
 * Removes a student from a room.
 * @param {string} joinCode - The join code of the room.
 * @param {string} studentId - The ID of the student to remove.
 */
export const removeStudentFromRoom = async (joinCode, studentId) => {
  try {
    const roomRef = doc(db, "rooms", joinCode);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      throw new Error("Room not found.");
    }

    const updatedStudents = roomDoc.data().students?.filter((student) => student.id !== studentId);

    await updateDoc(roomRef, {
      students: updatedStudents,
    });

    console.log("Student removed from room:", joinCode);
  } catch (error) {
    console.error("Error removing student from room:", error.message);
    throw error;
  }
};

/**
 * Deletes a room by its join code.
 * @param {string} joinCode - The join code of the room.
 */
export const deleteRoom = async (joinCode) => {
  try {
    const roomRef = doc(db, "rooms", joinCode);
    await deleteDoc(roomRef);

    console.log("Room deleted successfully:", joinCode);
  } catch (error) {
    console.error("Error deleting room:", error.message);
    throw error;
  }
};
