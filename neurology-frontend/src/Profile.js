import React from "react";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="card-container">
      <h2>Profilul meu</h2>
      {user ? (
        <>
          <p>Bine ai venit, <strong>{user.username}</strong>!</p>
          <p>Rol: <strong>{user.role}</strong></p>
        </>
      ) : (
        <p>Nu s-a găsit utilizatorul.</p>
      )}
    </div>
  );
}

export default Profile;
