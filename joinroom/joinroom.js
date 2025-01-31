import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';

function JoinRoom() {
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage('Please login first.');
        return;
      }

      const roomRef = doc(db, 'rooms', joinCode);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        await updateDoc(roomRef, {
          participants: arrayUnion(user.uid),
        });
        setMessage(`Joined room: ${joinCode}`);
        navigate(`/chatroom/${joinCode}`);
      } else {
        setMessage('Room not found!');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Join a Chat Room</h2>
      <input
        type="text"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
        placeholder="Room Code"
      />
      <button onClick={handleJoin}>Join</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default JoinRoom;
