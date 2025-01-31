import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";
import MergedPage from "./components/merged_page_student/merged_page";
import ClassroomTeacher from "./components/classroom_teacher/classroom_teacher";
import Chatroom from "./components/chatroom/chatroom";
import MergeTeacherPage from "./components/merge_teacher/merge_teacher.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [currentJoinCode, setCurrentJoinCode] = useState("");

  const navigateToChatroom = (joinCode) => {
    setCurrentJoinCode(joinCode);
  };

  const navigateToClassroomTeacher = (joinCode) => {
    setCurrentJoinCode(joinCode);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/home" />
          ) : (
            <AuthPage setUser={setUser} />
          )
        }
      />
      {user && (
        <>
          <Route
            path="/home"
            element={
              user.role === "student" ? (
                <Navigate to="/student" />
              ) : (
                <Navigate to="/teacher" />
              )
            }
          />
          <Route
            path="/student"
            element={
              <MergedPage
                joinCode={user.joinCode}
                navigateToChatroom={navigateToChatroom}
              />
            }
          />
          <Route
            path="/chatroom/:joinCode"
            element={<Chatroom joinCode={currentJoinCode} />}
          />
          <Route
            path="/teacher"
            element={
              <MergeTeacherPage
                navigateToClassroomTeacher={navigateToClassroomTeacher}
              />
            }
          />
          <Route
            path="/teacher/classroom"
            element={
              <ClassroomTeacher
                joinCode={currentJoinCode}
                navigateToChatroom={navigateToChatroom}
              />
            }
          />
        </>
      )}
      <Route
        path="*"
        element={<Navigate to={user ? "/home" : "/"} />}
      />
    </Routes>
  );
};

export default App;
