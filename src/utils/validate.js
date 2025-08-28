export const checkValidData = (email, password) => {

    const isEmailVaild = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const isPasswordValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);

    if(!isEmailVaild) return "Please enter a valid email";
    if(!isPasswordValid) return "Your password must contain between 4 and 60 characters."

    return null;

}