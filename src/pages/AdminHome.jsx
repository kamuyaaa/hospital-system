import React, { useEffect, useState } from "react";
import './AdminHome.css';
import { useNavigate } from "react-router-dom";

const user = JSON.parse(localStorage.getItem("user"));
const AdminHome = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    FullName: "",
    DOB: "",
    Gender: "",
    Address: "",
    PhoneNumber: "",
    MedicalHistory: "",
    AssignedDoctor: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Load patients from backend
  const fetchPatients = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add new patient
  const handleAddPatient = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        setFormData({
          FullName: "",
          DOB: "",
          Gender: "",
          Address: "",
          PhoneNumber: "",
          MedicalHistory: "",
          AssignedDoctor: "",
        });
        fetchPatients();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  // ✅ Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    try {
      await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: "DELETE",
      });
      fetchPatients();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (

    <div className="admin-container">
      <div className="logout-bar">
        <button className="logout-styled-btn" onClick={() => navigate("/")}>
          <span>Logout</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 74 74"
            height="34"
            width="34"
          >
            <circle strokeWidth="3" stroke="black" r="35.5" cy="37" cx="37"></circle>
            <path
              fill="black"
              d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"
            ></path>
          </svg>
        </button>
      </div>
      <h2>
        {user?.username
          ? `Welcome, ${user.username.charAt(0).toUpperCase() + user.username.slice(1)} – FCB Medical Clinic`
          : "Welcome – FCB Medical Clinic"}
      </h2>


      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleAddPatient} style={{ marginBottom: "30px" }}>
        <h3>Add New Patient</h3>
        <input name="FullName" placeholder="Full Name" value={formData.FullName} onChange={handleChange} required />
        <input type="date" name="DOB" value={formData.DOB} onChange={handleChange} required />
        <input name="Gender" placeholder="Gender" value={formData.Gender} onChange={handleChange} required />
        <input name="Address" placeholder="Address" value={formData.Address} onChange={handleChange} />
        <input name="PhoneNumber" placeholder="Phone Number" value={formData.PhoneNumber} onChange={handleChange} />
        <textarea name="MedicalHistory" placeholder="Medical History" value={formData.MedicalHistory} onChange={handleChange} />
        <input name="AssignedDoctor" placeholder="Assigned Doctor" value={formData.AssignedDoctor} onChange={handleChange} />

        <button type="submit">Add Patient</button>
      </form>

      <h3>Patient Records</h3>
      <input
        type="text"
        className="search-input"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>DOB</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Assigned Doctor</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients
            .filter((p) =>
              p.FullName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((p) => (
            <tr key={p.PatientID}>
              <td>{p.PatientID}</td>
              <td>{p.FullName}</td>
              <td>{new Date(p.DOB).toLocaleDateString()}</td>
              <td>{p.Gender}</td>
              <td>{p.PhoneNumber}</td>
              <td>{p.AssignedDoctor}</td>
              <td>
                <button onClick={() => handleDelete(p.PatientID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHome;
