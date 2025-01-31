import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";


export const handleSignup = async (email, password, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Store user data in Firestore
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: role,
    joinCode: "", // Add a default joinCode or leave it empty
  });

  return user;
};
export const handleLogin = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userId = userCredential.user.uid;

  // Fetch user data from Firestore
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) {
    throw new Error("User data not found!");
  }

  const userData = userDoc.data();
  return { ...userCredential.user};
};