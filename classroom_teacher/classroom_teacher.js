import React, { useState, useEffect } from "react";
import {
  listClassroomFiles,
  getStudentsByClassroom,
  removeStudentFromClassroom,
} from "../../firebaseUtils";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import "./classroom_teacher.css";
import { getStudentMessages } from "../../roomFunctions";

const ClassroomTeacher = ({ currentClass }) => {
  const [files, setFiles] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMessages, setStudentMessages] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!currentClass) return;

    const fetchFiles = async () => {
      try {
        setLoadingFiles(true);
        const classroomFiles = await listClassroomFiles(currentClass);
        setFiles(classroomFiles);
      } catch (error) {
        console.error("Error fetching files:", error.message);
      } finally {
        setLoadingFiles(false);
      }
    };

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const classroomStudents = await getStudentsByClassroom(currentClass);
        setStudents(classroomStudents);
      } catch (error) {
        console.error("Error fetching students:", error.message);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchFiles();
    fetchStudents();
  }, [currentClass]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const filePath = `classrooms/${currentClass}/${Date.now()}-${file.name}`;
    const fileRef = ref(getStorage(), filePath);

    try {
      setUploading(true);
      setUploadProgress(0);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress); // Update progress bar
        },
        (error) => {
          console.error("Error uploading file:", error.message);
          alert("File upload failed.");
          setUploading(false);
          setUploadProgress(0); // Reset progress bar
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFiles((prevFiles) => [
            ...prevFiles,
            { name: file.name, url: downloadURL, ref: filePath },
          ]);
          setFile(null);
          setUploadProgress(0); // Reset progress bar
          alert("File uploaded successfully!");
        }
      );
    } catch (error) {
      console.error("Error during upload:", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileRefPath) => {
    const fileRef = ref(getStorage(), fileRefPath);

    try {
      await deleteObject(fileRef);
      setFiles((prevFiles) => prevFiles.filter((file) => file.ref !== fileRefPath));
      alert("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error.message);
      alert("Failed to delete the file. Please try again.");
    }
  };

  const handleViewStudentMessages = async (studentId) => {
    try {
      setSelectedStudent(studentId);
      setShowDialog(true);

      console.log(`Fetching messages for student ID: ${studentId}`);
      const messages = await getStudentMessages(currentClass, studentId);
      console.log("Messages fetched:", messages);
      setStudentMessages(messages);
    } catch (error) {
      console.error("Error fetching student messages:", error.message);
      alert("Failed to fetch messages. Please try again.");
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setStudentMessages([]);
    setSelectedStudent(null);
  };

  return (
    <div className="classroom-teacher">
      {currentClass && (
        <div className="file-management">
          <h2 className="classroom-title">Classroom: {currentClass}</h2>

          <div className="upload-section">
            <h2 className="section-title">Upload a File</h2>
            <input
              className="file-input"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept="application/pdf"
            />
            <button className="upload-button" onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload File"}
            </button>
            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(uploadProgress)}%</span>
              </div>
            )}
          </div>

          <div className="files-section">
            <h2 className="section-title">Textbook Management</h2>
            {loadingFiles ? (
              <p>Loading files...</p>
            ) : files.length > 0 ? (
              <ul className="files-list">
                {files.map((file, index) => (
                  <li key={index} className="file-list-item">
                    <span className="file-name">{file.name}</span>
                    <button
                      className="view-button"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      View
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteFile(file.ref)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files available for this classroom.</p>
            )}
          </div>

          <div className="students-section">
            <h2 className="section-title">Student Management</h2>
            {loadingStudents ? (
              <p>Loading students...</p>
            ) : students.length > 0 ? (
              <ul className="students-list">
                {students.map((student, index) => (
                  <li key={index} className="student-list-item">
                    <span className="student-email">{student.email}</span>
                    <button
                      className="view-messages-button"
                      onClick={() => handleViewStudentMessages(student.id)}
                    >
                      View Messages
                    </button>
                    <button
                      className="remove-student-button"
                      onClick={() => removeStudentFromClassroom(currentClass, student.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No students in this classroom.</p>
            )}
          </div>

          {showDialog && (
            <div className="dialog-overlay">
              <div className="dialog">
                <h3>Messages from Student ID: {selectedStudent}</h3>
                {studentMessages.length > 0 ? (
                  <ul className="messages-list">
                    {studentMessages.map((msg) => (
                      <li key={msg.id} className="message-item">
                        <strong>{msg.sender === "chatGPT" ? "ChatGPT" : "Student"}:</strong> {msg.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No messages found for this student.</p>
                )}
                <button className="close-dialog-button" onClick={closeDialog}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassroomTeacher;
