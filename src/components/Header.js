import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { addUser, removeUser } from "../utils/userSlice"
import { LOGO, SRIFLIX_LOGO, user_AVATAR } from "../utils/constants";


const Header = () => {

  const user = useSelector((store) => store.user);

  const dispatch = useDispatch();


  const navigate = useNavigate();
  const handleSignOut = () => {

    signOut(auth).then(() => {
    }).catch((error) => {
      navigate("/error")
    });
  };

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName } = user;
        dispatch(addUser({ uid: uid, email: email, displayName: displayName }));
        navigate("/browse");

      } else {
        dispatch(removeUser());
        navigate("/")
        // ...
      }
    });
    return () => unsubscribe();
  }, [])


  return (
    <div className="absolute px-8 py-2 bg-gradient-to-b from-black z-10 justify-between flex w-full">
      <img className="w-1/6" data-test-id="netflix-logo" src={LOGO} alt="logo" />
      {user && <p className="text-white text-lg font-bold py-8 ">Welcome {user.displayName}!</p>}
      {user && <div className="flex  m-4">
        <img className="w-12 h-12  m-4 rounded" alt="usericon" src={user_AVATAR} />
        <button onClick={handleSignOut} className="text-red-600 font-bold py-2 my-2">Sign out</button>
      </div>}
    </div>
  )
}

export default Header;