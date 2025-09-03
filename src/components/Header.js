import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { addUser, removeUser } from "../utils/userSlice"
import { LOGO, SRIFLIX_LOGO, SUPPORTED_LANGUAGES, user_AVATAR } from "../utils/constants";
import { toggleGptSearchView } from "../utils/gptSlice";
import { selectLanguage } from "../utils/configSlice";
import lang from "../utils/language constants";


const Header = () => {

  const language = useSelector((store) => store.config.lang)


  const user = useSelector((store) => store.user);
  const gptSearch = useSelector((store) => store.gpt.showGptSearch);

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
  }, []);

  const handleGptSearchClick = () => {
    dispatch(toggleGptSearchView());
  };
  const handleLangChange = (e) => {
    dispatch(selectLanguage(e.target.value));
  }


  return (
    <div className="absolute px-8 py-2 bg-gradient-to-b from-black z-10 justify-between flex w-full">
      <img className="w-1/6" data-test-id="netflix-logo" src={LOGO} alt="logo" />
      {user && <p className="text-white text-lg font-bold py-8 ">Welcome {user.displayName}!</p>}
      {user && <div className="flex m-4 ">
        {gptSearch && <select className="flex mt-5 mr-3.5 p-2 h-10 rounded hover:cursor-pointer" onChange={handleLangChange}>
          {SUPPORTED_LANGUAGES.map((lang) => <option key={lang.identifier} value={lang.identifier}>{lang.name}</option>)}
        </select>}
        <button className="bg-blue-700 mt-5 mr-3.5 p-2 h-10 rounded font-bold text-white hover:bg-blue-300 bg-opacity-80" onClick={handleGptSearchClick}>{gptSearch ? (lang[language].homePage) : "✨ Search"}</button>
        <img className="w-12 h-12  m-4 rounded" alt="usericon" src={user_AVATAR} />
        <button onClick={handleSignOut} className="text-white font-bold mb-2 py-2 hover:opacity-60">{!gptSearch ? lang.en.signOut : lang[language].signOut}</button>
      </div>}
    </div>
  )
}

export default Header;