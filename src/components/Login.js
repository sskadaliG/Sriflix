import { useRef, useState } from 'react';
import Header from './Header';
import { checkValidData } from '../utils/validate';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../utils/firebase';
import { addUser } from '../utils/userSlice';
import { useDispatch } from 'react-redux';
import { BACKGROUND_LOGO, SRIFLIX_BG_LOGO, user_AVATAR } from '../utils/constants';

const Login = () => {
    const [isSignInForm, setIsSignInForm] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const dispatch = useDispatch();

    const email = useRef(null);
    const password = useRef(null);
    const name = useRef(null);

    const onClickHandle = () => {
        const message = checkValidData(email.current.value, password.current.value);
        setErrorMessage(message);

        if (message) return;

        if (!isSignInForm) {
            createUserWithEmailAndPassword(auth, email.current.value, password.current.value)
                .then((userCredential) => {
                    // Signed up 
                    const user = userCredential.user;
                    updateProfile(user, {
                        displayName: name.current.value,
                        photoURL: user_AVATAR
                    }).then(() => {
                        const { uid, email, displayName, photoURL } = auth.currentUser;
                        dispatch(addUser({ uid: uid, email: email, displayName: displayName, photoURL: photoURL }))
                        // Profile updated!
                        // ...
                    }).catch((error) => {
                        // An error occurred
                        // ...
                    });
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // ..
                    setErrorMessage(errorCode + " - " + errorMessage);
                });
        } else {
            signInWithEmailAndPassword(auth, email.current.value, password.current.value)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                    // ...
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    setErrorMessage(errorMessage);
                });


        }
    };



    const toggleSignInForm = () => {
        setIsSignInForm(!isSignInForm);
    }

    return (
        <div>
            <Header />
            <div>
                <img className="absolute bg-opacity-90" src={BACKGROUND_LOGO} alt="background-logo" />
            </div >
            <form onSubmit={(e) => e.preventDefault()} className="absolute bg-black w-3/12 p-16 my-36 mx-auto right-0 left-0 text-white opacity-85 rounded">

                <h1 className="font-bold text-3xl py-4">{isSignInForm ? "Sign In" : "Sign Up"}</h1>

                {!isSignInForm && <input ref={name} type="text" placeholder="Full Name" className="p-4 my-2 w-full rounded bg-black border border-white"></input>}

                <input ref={email} type="text" placeholder="Email" className="p-4 my-2 w-full rounded bg-black border border-white"></input>

                <input ref={password} type="password" placeholder="Password" className="p-4 my-2 w-full rounded bg-black border border-white"></input>

                <p className="text-sm font-bold text-red-600">{errorMessage}</p>

                <button className="p-2 my-4 bg-red-700 w-full rounded font-bold cursor-pointer hover:bg-red-800" onClick={onClickHandle}>{isSignInForm ? "Sign In" : "Sign Up"}</button>

                {isSignInForm && <p className=" text-center">OR</p>}

                {isSignInForm && <button className="p-2 my-4 bg-gray-800 w-full rounded font-bold cursor-pointer hover:bg-gray-900">Use a Sign-In Code</button>}

                {isSignInForm && <p className=" text-center cursor-pointer hover:text-gray-300 underline">Forgot password?</p>}

                <div className="flex my-4">
                    <p>{isSignInForm ? "New to Sriflix?" : "Already a customer?"}</p>

                    <p className=" text-center cursor-pointer hover:underline px-2 font-bold" onClick={toggleSignInForm}>{isSignInForm ? "Sign up now." : "Sign in here"}</p>
                </div>

                <p className="text-sm text-gray-500">This page is protected by Google reCAPTCHA to ensure you're not a bot.</p>

                <p className="text-sm text-blue-500 py-2 underline cursor-pointer">Learn more</p>

            </form>

        </div>
    )
}

export default Login;