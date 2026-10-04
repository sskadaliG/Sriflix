import React, { useRef, useState } from 'react'
import lang from '../utils/languageConstants';
import { useDispatch, useSelector } from 'react-redux';
import { addAiMovieResult } from '../utils/aiSlice';
import { auth } from '../utils/firebase';
import { sendEmailVerification } from 'firebase/auth';


const AiSearchBar = () => {

  const language = useSelector((store) => store.config.lang);

  const selectText = useRef(null);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  // Sign-up already sent one email, and Firebase throttles repeat sends to the
  // same user, so a quick resend often fails with auth/too-many-requests.
  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setResendStatus("sent");
    } catch (err) {
      setResendStatus(err.code === "auth/too-many-requests" ? "throttled" : "failed");
    }
  };

  const handleSearch = async () => {
    const query = selectText.current.value.trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setNeedsVerification(false);
    try {
      // The serverless function calls Gemini and TMDB so no keys reach the browser.
      // It only answers signed-in users, so send the Firebase ID token along.
      // getIdToken() refreshes the token automatically when it has expired.
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in to use AI search");

      // The function also requires a verified email. The saved token still says
      // "unverified" after the user clicks the email link, so reload the user
      // and force a fresh token in that case.
      if (!user.emailVerified) await user.reload();
      if (!user.emailVerified) {
        setNeedsVerification(true);
        throw new Error("Please verify your email to use AI search.");
      }
      const { token, claims } = await user.getIdTokenResult();
      const idToken = claims.email_verified ? token : await user.getIdToken(true);
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.code === "email-not-verified") setNeedsVerification(true);
      if (!response.ok) throw new Error(data.error || "Search failed");

      dispatch(addAiMovieResult({ movieNames: data.movieNames, movieResults: data.movieResults }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center pt-36 pb-8">
      <div className="bg-black w-1/2 bg-opacity-80 rounded">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="grid grid-cols-12 w-full ">
          <input ref={selectText} maxLength={200} className=" text-black p-4 m-4 col-span-9 rounded bg-opacity-80" type="text" placeholder={lang[language].aiSearchPlaceHolder}></input>
          <button type="submit" disabled={loading} className="bg-red-700 text-white my-4 mr-4 col-span-3 rounded bg-opacity-80 hover:opacity-80 disabled:opacity-50">
            {loading ? "..." : lang[language].search}
          </button>
        </form>
        {error && <p className="text-red-500 font-bold px-4 pb-4">{error}</p>}
        {needsVerification && (
          <p className="text-white px-4 pb-4">
            We sent a verification link to {auth.currentUser?.email} when you signed up. Check your inbox and spam folder, click the link, then search again.{" "}
            {resendStatus === "sent" && "A new verification email is on its way. "}
            {resendStatus === "throttled" && "A verification email was sent recently, so please check for that one or try resending in a few minutes. "}
            {resendStatus === "failed" && "Couldn't send the email, please try again later. "}
            {resendStatus !== "sent" && (
              <button type="button" onClick={handleResendVerification} className="underline hover:opacity-80">Didn't get it? Resend</button>
            )}
          </p>
        )}
      </div>
    </div>

  )
}

export default AiSearchBar;
