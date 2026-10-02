import { useRef, useState } from 'react';
import Header from './Header';
import { checkValidData } from '../utils/validate';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../utils/firebase';
import { addUser } from '../utils/userSlice';
import { useDispatch } from 'react-redux';
import { BACKDROP_CLASSES } from '../utils/constants';
import Footer from './Footer';

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
                        displayName: name.current.value
                    }).then(() => {
                        const { uid, email, displayName } = auth.currentUser;
                        dispatch(addUser({ uid: uid, email: email, displayName: displayName }))
                    }).catch((error) => {
                        setErrorMessage(error.message);
                    });
                })
                .catch((error) => {
                    setErrorMessage(error.message);
                });
        } else {
            // On success, the onAuthStateChanged listener in Header redirects to /browse.
            signInWithEmailAndPassword(auth, email.current.value, password.current.value)
                .catch((error) => {
                    setErrorMessage(error.message);
                });


        }
    };



    const toggleSignInForm = () => {
        setIsSignInForm(!isSignInForm);
    }

    return (
        <div>
            <Header />
            <div className={BACKDROP_CLASSES} />
            <div className="min-h-screen flex flex-col">
            <form onSubmit={(e) => e.preventDefault()} className="bg-black w-full max-w-md p-12 mt-36 mb-12 mx-auto text-white opacity-85 rounded">

                <h1 className="font-bold text-3xl py-4">{isSignInForm ? "Sign In" : "Sign Up"}</h1>

                {!isSignInForm && <input ref={name} type="text" placeholder="Full Name" className="p-4 my-2 w-full rounded bg-black border border-white"></input>}

                <input ref={email} type="text" placeholder="Email" className="p-4 my-2 w-full rounded bg-black border border-white"></input>

                <input ref={password} type="password" placeholder="Password" className="p-4 my-2 w-full rounded bg-black border border-white"></input>

                <p className="text-sm font-bold text-red-600">{errorMessage}</p>

                <button className="p-2 my-4 bg-red-700 w-full rounded font-bold cursor-pointer hover:bg-red-800" onClick={onClickHandle}>{isSignInForm ? "Sign In" : "Sign Up"}</button>

                <div className="flex my-4">
                    <p>{isSignInForm ? "New to Sriflix?" : "Already have an account?"}</p>

                    <p className=" text-center cursor-pointer hover:underline px-2 font-bold" onClick={toggleSignInForm}>{isSignInForm ? "Sign up now." : "Sign in here"}</p>
                </div>

            </form>
            <div className="mt-auto"><Footer /></div>
            </div>

        </div>
    )
}

export default Login;