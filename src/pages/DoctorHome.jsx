import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorHome.css";

const DoctorHome = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [triage, setTriage] = useState({ temp: "", bp: "", pulse: "" });
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");

  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPatientName, setHistoryPatientName] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


  // Fetch patients list
  useEffect(() => {
    fetch("http://localhost:5000/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  // Fetch patient history
  const fetchHistory = (patientId, patientName) => {
    fetch(`http://localhost:5000/api/treatment-history/${patientId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setHistoryPatientName(patientName);
        setShowHistoryModal(true);
      })
      .catch((err) => console.error("History fetch error:", err));
  };

  // Submit treatment
  const handleSubmit = () => {
    if (!selectedPatient) return;

    const payload = {
      patientId: selectedPatient.PatientID,
      temp: triage.temp,
      bp: triage.bp,
      pulse: triage.pulse,
      symptoms,
      diagnosis,
      prescription,
    };

    fetch("http://localhost:5000/api/treatment-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setConfirmMessage(`Treatment for ${selectedPatient.FullName} saved successfully.`);
        setShowConfirmModal(true);

        // Reset form
        setSelectedPatient(null);
        setTriage({ temp: "", bp: "", pulse: "" });
        setSymptoms("");
        setDiagnosis("");
        setPrescription("");
      })
      .catch((err) => console.error("Submit error:", err));
  };

  return (
    <div className="treat-container">
      {/* Logout Button */}
      <div className="logout-bar">
        <button
          className="logout-styled-btn"
          onClick={() => setShowLogoutConfirm(true)}
        >
          Logout
        </button>


      </div>

      {/* Header */}
      <h2>Welcome, Dr. {user?.username || ""} – FCB Medical Clinic</h2>
      <h3>Select a Patient to Treat</h3>

      {/* Patients Table */}
      <table className="patient-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const birthDate = new Date(p.DOB);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }

            return (
              <tr key={p.PatientID}>
                <td>{p.FullName}</td>
                <td>{age}</td>
                <td>{p.Gender}</td>
                <td>
                  <button onClick={() => setSelectedPatient(p)}>Treat</button>
                  <button
                    className="view-history-btn"
                    style={{ marginLeft: "8px" }}
                    onClick={() => fetchHistory(p.PatientID, p.FullName)}
                  >
                    View History
                  </button>

                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Treatment Form */}
      {selectedPatient && (
        <div className="treatment-form">
          <h3>Treatment Form for {selectedPatient.FullName}</h3>

          <div className="triage-section">
            <div className="triage-inputs">
              <label>Temperature (°C)</label>
              <input
                type="text"
                value={triage.temp}
                onChange={(e) => setTriage({ ...triage, temp: e.target.value })}
              />

              <label>Blood Pressure (mmHg)</label>
              <input
                type="text"
                value={triage.bp}
                onChange={(e) => setTriage({ ...triage, bp: e.target.value })}
              />

              <label>Pulse (bpm)</label>
              <input
                type="text"
                value={triage.pulse}
                onChange={(e) => setTriage({ ...triage, pulse: e.target.value })}
              />
            </div>

            <div className="symptoms-section">
              <label>Symptoms</label>
              <textarea
                rows="6"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="diagnosis-section">
            <label>Diagnosis</label>
            <textarea
              rows="4"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            ></textarea>

            <label>Prescription</label>
            <textarea
              rows="4"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            ></textarea>

            <button className="submit-btn" onClick={handleSubmit}>
              Submit Diagnosis
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Treatment History for {historyPatientName}</h3>
            {history.length === 0 ? (
              <p>No previous treatments found.</p>
            ) : (
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Temp</th>
                    <th>BP</th>
                    <th>Pulse</th>
                    <th>Symptoms</th>
                    <th>Diagnosis</th>
                    <th>Prescription</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                     <td>
                        {new Date(h.TreatmentDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        {new Date(h.TreatmentDate).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td>{h.Temperature}</td>
                      <td>{h.BP}</td>
                      <td>{h.Pulse}</td>
                      <td>{h.Symptoms}</td>
                      <td>{h.Diagnosis}</td>
                      <td>{h.Prescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              style={{ marginTop: "10px", backgroundColor: "#e74c3c" }}
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{confirmMessage}</p>
            <button
              style={{ marginTop: "10px", backgroundColor: "#27ae60" }}
              onClick={() => setShowConfirmModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
  <div className="modall-overlay">
    <div className="modall-content">
      <h3>Confirm Logout</h3>
      <p>Are you sure you want to log out?</p>
      <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "center" }}>
        <button
          style={{
            backgroundColor: "#e74c3c",
            color: "white",
            padding: "8px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}
        >
          Logout
        </button>
        <button
          style={{
            backgroundColor: "#09bcc9ff",
            color: "white",
            padding: "8px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default DoctorHome;
