import React from 'react'
import './Login.css'
const Login = () => {


    const handleLogin = () => {
        // Redirect to the backend for OAuth
        window.location.href = 'http://localhost:5000/login';
    };


    return (
        <>
            <div className='mainDiv'>
                <button onClick={handleLogin}>Login with Outlook</button>
            </div>

        </>

    )
}

export default Login