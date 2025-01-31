import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Initialize Firestore and Storage
const firestore = getFirestore();
const storage = getStorage();

/**
 * List all files in a classroom.
 * @param {string} joinCode - The join code of the classroom.
 * @returns {Array} - List of files with names and URLs.
 */
export const listClassroomFiles = async (joinCode) => {
  const classroomRef = ref(storage, `classrooms/${joinCode}`);

  try {
    const res = await listAll(classroomRef);

    // Retrieve download URLs for each file
    const filePromises = res.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return {
        name: itemRef.name,
        url,
      };
    });

    const files = await Promise.all(filePromises);
    return files;
  } catch (error) {
    console.error(`Error listing files for classroom ${joinCode}:`, error.message);
    throw error;
  }
};

/**
 * Upload a file to a classroom.
 * @param {string} joinCode - The join code of the classroom.
 * @param {File} file - The file to be uploaded.
 * @returns {Object} - The uploaded file's name and URL.
 */
export const uploadClassroomFile = async (joinCode, file) => {
  const filePath = `classrooms/${joinCode}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, filePath);

  try {
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error(`Error uploading file to classroom ${joinCode}:`, error.message);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ name: file.name, url });
        }
      );
    });
  } catch (error) {
    console.error(`Error uploading file to classroom ${joinCode}:`, error.message);
    throw error;
  }
};

/**
 * Get the list of students in a classroom.
 * @param {string} joinCode - The join code of the classroom.
 * @returns {Array} - List of student email addresses.
 */
export const getStudentsByClassroom = async (joinCode) => {
  const roomDocRef = doc(firestore, "rooms", joinCode);

  try {
    const roomSnapshot = await getDoc(roomDocRef);
    if (roomSnapshot.exists()) {
      const data = roomSnapshot.data();
      return data.students || [];
    } else {
      console.warn(`No room found with join code: ${joinCode}`);
      return [];
    }
  } catch (error) {
    console.error(`Error retrieving students for classroom ${joinCode}:`, error.message);
    throw error;
  }
};

/**
 * Add a student to a classroom.
 * @param {string} joinCode - The join code of the classroom.
 * @param {string} studentEmail - The email of the student to be added.
 */
export const addStudentToClassroom = async (joinCode, studentEmail) => {
  const roomDocRef = doc(firestore, "rooms", joinCode);

  try {
    await updateDoc(roomDocRef, {
      students: arrayUnion(studentEmail),
    });
    console.log(`Added ${studentEmail} to classroom ${joinCode}`);
  } catch (error) {
    console.error(`Error adding student to classroom ${joinCode}:`, error.message);
    throw error;
  }
};

/**
 * Remove a student from a classroom.
 * @param {string} joinCode - The join code of the classroom.
 * @param {string} studentEmail - The email of the student to be removed.
 */
export const removeStudentFromClassroom = async (joinCode, studentEmail) => {
  const roomDocRef = doc(firestore, "rooms", joinCode);

  try {
    await updateDoc(roomDocRef, {
      students: arrayRemove(studentEmail),
    });
    console.log(`Removed ${studentEmail} from classroom ${joinCode}`);
  } catch (error) {
    console.error(`Error removing student from classroom ${joinCode}:`, error.message);
    throw error;
  }
};

/**
 * Create a new classroom.
 * @param {string} joinCode - The join code of the new classroom.
 * @param {string} teacherId - The ID of the teacher creating the classroom.
 * @param {string} roomName - The name of the classroom.
 */
export const createClassroom = async (joinCode, teacherId, roomName) => {
  const roomDocRef = doc(firestore, "rooms", joinCode);

  try {
    await setDoc(roomDocRef, {
      joinCode,
      teacherId,
      roomName,
      students: [],
      createdAt: new Date().toISOString(),
    });
    console.log(`Classroom ${roomName} created with join code ${joinCode}`);
  } catch (error) {
    console.error(`Error creating classroom ${joinCode}:`, error.message);
    throw error;
  }
};
