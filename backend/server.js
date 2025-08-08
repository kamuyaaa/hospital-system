const express = require("express");
const cors = require("cors");
const ADODB = require("node-adodb");

// Path to your Access database (.accdb)
const db = ADODB.open("Provider=Microsoft.ACE.OLEDB.12.0;Data Source=C:\\Users\\katua\\Desktop\\hospital-system-1\\hospital_db.accdb;");

const app = express();
app.use(cors());
app.use(express.json());

// === LOGIN ROUTE ===
app.post("/api/login", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const query = `
      SELECT * FROM Users 
      WHERE Username='${username}' 
      AND Password='${password}' 
      AND Role='${role}'
    `;
    console.log("LOGIN QUERY:", query);

    const users = await db.query(query);

    if (users && users.length > 0) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/patients", async (req, res) => {
  const { FullName, DOB, Gender, Address, PhoneNumber, MedicalHistory, AssignedDoctor } = req.body;

  const query = `
    INSERT INTO Patients (FullName, DOB, Gender, Address, PhoneNumber, MedicalHistory, AssignedDoctor)
    VALUES ('${FullName}', '${DOB}', '${Gender}', '${Address}', '${PhoneNumber}', '${MedicalHistory}', '${AssignedDoctor}')
  `;

  try {
    await db.execute(query);
    res.json({ success: true, message: "Patient added successfully" });
  } catch (error) {
    console.error("Add Patient Error:", error);
    res.status(500).json({ success: false, message: "Failed to add patient" });
  }
});

app.get("/api/patients", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Patients");
    res.json(result);
  } catch (error) {
    console.error("Fetch Patients Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch patients" });
  }
});

app.get("/api/patients/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(`SELECT * FROM Patients WHERE PatientID = ${id}`);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    console.error("Get Patient Error:", error);
    res.status(500).json({ message: "Error retrieving patient" });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  const id = req.params.id;
  const { FullName, DOB, Gender, Address, PhoneNumber, MedicalHistory, AssignedDoctor } = req.body;

  const query = `
    UPDATE Patients
    SET FullName='${FullName}', DOB='${DOB}', Gender='${Gender}', Address='${Address}',
        PhoneNumber='${PhoneNumber}', MedicalHistory='${MedicalHistory}', AssignedDoctor='${AssignedDoctor}'
    WHERE PatientID = ${id}
  `;

  try {
    await db.execute(query);
    res.json({ success: true, message: "Patient updated successfully" });
  } catch (error) {
    console.error("Update Patient Error:", error);
    res.status(500).json({ success: false, message: "Failed to update patient" });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  const id = req.params.id;

  const query = `DELETE FROM Patients WHERE PatientID = ${id}`;

  try {
    await db.execute(query);
    res.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Delete Patient Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete patient" });
  }
});

// === UPDATE PATIENT MEDICAL HISTORY ===
app.post("/api/medical-history", async (req, res) => {
  const { patientId, diagnosis } = req.body;

  if (!patientId || !diagnosis) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const updateQuery = `
      UPDATE Patients
      SET MedicalHistory = '${diagnosis}'
      WHERE PatientID = ${patientId}
    `;

    await db.execute(updateQuery);

    res.json({ success: true, message: "Medical history updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// === ADD PATIENT TREATMENT HISTORY WITH FOREIGN KEY CHECK ===
// === ADD PATIENT TREATMENT HISTORY WITH FOREIGN KEY CHECK ===
app.post("/api/treatment-history", async (req, res) => {
  const { patientId, temp, bp, pulse, symptoms, diagnosis, prescription } = req.body;

  if (!patientId || !diagnosis) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // 1️⃣ Check if patient exists
    const checkPatientQuery = `SELECT * FROM Patients WHERE PatientID = ${patientId}`;
    const patient = await db.query(checkPatientQuery);

    if (!patient || patient.length === 0) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // 2️⃣ Create Access-compatible date format (#MM/DD/YYYY HH:MM:SS#)
    const treatmentDate = new Date();
    const formattedDate = `${
      treatmentDate.getMonth() + 1
    }/${treatmentDate.getDate()}/${treatmentDate.getFullYear()} ${treatmentDate
      .toTimeString()
      .split(" ")[0]}`;

    // 3️⃣ Insert treatment history
    const insertQuery = `
      INSERT INTO PatientTreatmentHistory 
      (PatientID, TreatmentDate, Temperature, BP, Pulse, Symptoms, Diagnosis, Prescription)
      VALUES 
      (${patientId}, #${formattedDate}#, '${temp || ""}', '${bp || ""}', '${pulse || ""}', 
      '${symptoms || ""}', '${diagnosis || ""}', '${prescription || ""}')
    `;

    await db.execute(insertQuery);

    res.json({ success: true, message: "Treatment history saved successfully" });
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// === GET PATIENT TREATMENT HISTORY ===
app.get("/api/treatment-history/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    const query = `
      SELECT TreatmentDate, Temperature, BP, Pulse, Symptoms, Diagnosis, Prescription
      FROM PatientTreatmentHistory
      WHERE PatientID = ${patientId}
      ORDER BY TreatmentDate DESC
    `;

    const history = await db.query(query);
    res.json(history);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// === START SERVER ===
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
