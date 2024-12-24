import React, { useState } from "react";
import "./Home.css";

const Home = () => {
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("Sync-Email-to-elastisearch");


  const handleEmail = async () => {
    try {
      const token = window.localStorage.getItem("token");
      console.log("token " + token);
      const response = await fetch("http://localhost:5000/testfetchFromElasticSearch", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Fetched data:", data);
      setEmails(data);
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  const handleSyncEmail = async () => {
    try {
      const token = window.localStorage.getItem("token");
      console.log("token " + token);
      const fetchEmailsResponse = await fetch("http://localhost:5000/testfetchEmails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await fetchEmailsResponse.json();
      console.log("Sync data:", data);
      setProgress("complete");
    } catch (error) {
      console.error(error);
    }
  };

  const ReadOrUnread = async (value, id) => {
    try {
      const token = window.localStorage.getItem("token");
      console.log(id)
      const readOrUnreadResponse = await fetch("http://localhost:5000/read-or-unread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: value,id:id }),
      });

      const data = await readOrUnreadResponse.json();
      console.log("Sync data:", data);
    } catch (error) {
      console.error(error);
    }
  }

  const ReadMail = async () => {
    try {
      const token = window.localStorage.getItem("token");
      
      const readMailResponse = await fetch("http://localhost:5000/readmail", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await readMailResponse.json();
      console.log("readMailResponse:", data);
      setEmails(data);
    } catch (error) {
      console.error(error);
    }
  }

  const UnReadMail = async () => {
    try {
      const token = window.localStorage.getItem("token");
      
      const unReadMailResponse = await fetch("http://localhost:5000/unreadmail", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await unReadMailResponse.json();
      console.log("readMailResponse:", data);
      setEmails(data);
    } catch (error) {
      console.error(error);
    }
  }

  

  return (
    <>
      <button onClick={handleSyncEmail}>{progress}</button>
      <button onClick={handleEmail}>SHOW ALL</button>
      <button onClick={ReadMail}>ALL READ MAIL</button>
      <button onClick={UnReadMail}>ALL UN READ MAIL</button>
   
      <div>
        <h1>Welcome to your Emails</h1>
        {error && <p>Error: {error}</p>}
        <ul>
          {emails.map((email) => (
            <li key={email.id}>
              <div className="email-header" >
                <strong>{email.subject}</strong>
                <span>{email.from}</span>
                <span>{email.status}</span>
                <input type="checkbox" onClick={(e) => ReadOrUnread(e.target.checked ? 1 : 0, email.id)} checked={email.status === "read"}  />
              </div>
              <div>
                {email.bodyPreview}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Home;
