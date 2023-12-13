import { Link,Navigate } from "react-router-dom";
import React, { useEffect, useContext } from 'react';
import { UserContext } from "./UserContext";
export default function Header() {
  const {userInfo,setUserInfo} = useContext(UserContext);
  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    })
      .then((response) => {
        response.json().then((userInfo) => {
          setUserInfo(userInfo);
        });
      });
  }, []);
  
  function logout(){
    fetch('http://localhost:4000/logout', {
      method: 'Post',
      credentials: 'include',
    });
    setUserInfo(null);
    return <Navigate to={"/"} />;
  }

  const username = userInfo?.username;
  return (
    <header>
      <Link to="/" className="logo">
        MyBlog
      </Link>
      <nav>
        {username && (
          <>
            <Link to="/create">Create new post</Link>
            <a onClick={logout}>Logout</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
