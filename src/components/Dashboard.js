// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import your Firebase configuration
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
} from "firebase/firestore"; // Import necessary Firestore methods
import * as XLSX from "xlsx"; // Import xlsx for Excel handling
import "./Dashboard.css"; // Import the new CSS file

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [showVouchers, setShowVouchers] = useState(false); // State for toggling voucher visibility
  const [availableVouchers, setAvailableVouchers] = useState([]); // State for available vouchers

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Parsed Excel Data: ", jsonData); // Log parsed data

      try {
        const batch = writeBatch(db); // Create a new batch instance
        const voucherCollection = collection(db, "vouchers");

        // Fetch existing vouchers from the database
        const existingVouchersSnapshot = await getDocs(voucherCollection);
        const existingVouchers = existingVouchersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Create a Set of existing voucher numbers for quick lookup
        const existingVoucherNumbers = new Set(
          existingVouchers.map((v) => v.number)
        );

        // Track which vouchers need to be deleted and updated
        const newVoucherNumbers = new Set(jsonData.map((v) => v.number));

        // Delete vouchers that are no longer in the new upload
        existingVouchers.forEach((voucher) => {
          if (!newVoucherNumbers.has(voucher.number)) {
            // If the voucher is not in the new data, delete it
            deleteDoc(doc(voucherCollection, voucher.id)); // Deleting the voucher from Firestore
          }
        });

        // Process the new vouchers
        jsonData.forEach((voucher) => {
          // Ensure each voucher has the required fields
          if (!voucher.number || !voucher.description || !voucher.expiration) {
            console.error("Missing required fields in voucher: ", voucher);
            setUploadMessage(
              "Some vouchers are missing required fields. Please check your Excel file."
            );
            return;
          }

          const docRef = doc(voucherCollection, voucher.number); // Use voucher number as document ID
          batch.set(docRef, {
            number: voucher.number,
            description: voucher.description,
            expiration: voucher.expiration,
            isUsed: voucher.isUsed || false, // Add isUsed status, default to false
          }); // Set or update the voucher data in the batch
        });

        await batch.commit(); // Commit the batch write
        setUploadMessage("Vouchers uploaded successfully!"); // Show success message
        setFile(null); // Clear the selected file
        fetchAvailableVouchers(); // Refresh the voucher list after upload
      } catch (error) {
        console.error("Error uploading vouchers: ", error.message); // Log the error message
        setUploadMessage(
          "Error uploading vouchers. Please check the console for more details."
        ); // Show error message
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const fetchAvailableVouchers = async () => {
    const vouchersRef = collection(db, "vouchers");
    const snapshot = await getDocs(vouchersRef);
    const vouchers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAvailableVouchers(vouchers);
  };

  const downloadVouchersExcel = () => {
    // Prepare the data for download
    const vouchersWithStatus = availableVouchers.map((voucher) => ({
      number: voucher.number,
      description: voucher.description,
      expiration: voucher.expiration,
      status: voucher.isUsed ? "Used" : "Unused", // Assuming isUsed is a boolean field in your database
    }));

    // Create a new workbook and add the available vouchers
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(vouchersWithStatus);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Available Vouchers");

    // Generate a binary string and create a Blob for the download
    XLSX.writeFile(workbook, "Available_Vouchers.xlsx");
  };

  const handleShowVouchers = () => {
    setShowVouchers(!showVouchers);
    if (!showVouchers) {
      fetchAvailableVouchers(); // Fetch vouchers when showing the list
    }
  };

  useEffect(() => {
    fetchAvailableVouchers(); // Initial fetch of available vouchers
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashbaord-wrapper">
        <div className="daashboard-title">
          <h2>Voucher Dashboard</h2>
        </div>
        <div className="dashbaord-inputs">
          <div className="upload-file-input">
            <label htmlFor="file-upload" className="custom-file-upload">
              Upload Vouchers XLSX
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />
          </div>
          <div className="download-upload-btn">
            <button onClick={handleUpload}>Upload Vouchers</button>
            <button onClick={downloadVouchersExcel}>
              Download Vouchers List
            </button>
          </div>
          {uploadMessage && <p>{uploadMessage}</p>}{" "}
          {/* Display upload message */}
          {/* <button onClick={handleShowVouchers}>
            {showVouchers ? "Hide Vouchers" : "Show Available Vouchers"}
          </button> */}
        </div>
        {showVouchers && (
          <div>
            <h3>Available Vouchers</h3>
            <ul>
              {availableVouchers.map((voucher) => (
                <li key={voucher.id}>
                  <span>
                    {voucher.number} - {voucher.description} -{" "}
                    {voucher.expiration}
                  </span>
                  <span
                    className={voucher.isUsed ? "status-used" : "status-unused"}
                  >
                    {voucher.isUsed ? "Used" : "Unused"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
