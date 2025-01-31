import React, { useState, useEffect } from "react";
import JoinCodeCreation from "../joincode_creation/joincode_creation";
import ClassroomTeacher from "../classroom_teacher/classroom_teacher";
import "./merge_teacher.css";

const MergeTeacherPage = ({ navigateToChatroom }) => {
  const [currentClass, setCurrentClass] = useState(null);

  const handleClassSelection = (classId) => {
    setCurrentClass(classId);
  };

  return (
    <div className="merge-teacher-page">
      {/* Left Section: JoinCodeCreation */}
      <div className="left-section">
        <JoinCodeCreation navigateToClassroomTeacher={handleClassSelection} />
      </div>

      {/* Right Section: ClassroomTeacher */}
      <div className="right-section">
        <ClassroomTeacher
          navigateToChatroom={navigateToChatroom}
          currentClass={currentClass}
        />
      </div>
    </div>
  );
};

export default MergeTeacherPage;