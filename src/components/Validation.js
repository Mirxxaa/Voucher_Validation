// src/components/Validation.js
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./Validation.css";

const Validation = () => {
  const [voucherNumber, setVoucherNumber] = useState("");
  const [message, setMessage] = useState("");
  const [voucherDescription, setVoucherDescription] = useState("");

  const handleValidation = async () => {
    const vouchersRef = collection(db, "vouchers");
    const snapshot = await getDocs(vouchersRef);
    const vouchers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const foundVoucher = vouchers.find(
      (voucher) => voucher.number === voucherNumber
    );

    if (!foundVoucher) {
      setMessage("No voucher found.");
      setVoucherDescription("");
      startResetTimer();
      return;
    }

    if (foundVoucher.status === "used") {
      setMessage("Voucher has already been used.");
      setVoucherDescription("");
      startResetTimer();
      return;
    }

    await markVoucherAsUsed(foundVoucher.id);
    setMessage("Voucher redeemed successfully!");
    setVoucherDescription(foundVoucher.description);

    startResetTimer();
  };

  const markVoucherAsUsed = async (voucherId) => {
    try {
      const voucherRef = doc(db, "vouchers", voucherId);
      await updateDoc(voucherRef, { status: "used" });
      console.log("Voucher marked as used.");
    } catch (error) {
      console.error("Error marking voucher as used:", error);
    }
  };

  const startResetTimer = () => {
    setTimeout(() => {
      resetForm();
    }, 15000);
  };

  const resetForm = () => {
    setVoucherNumber("");
    setMessage("");
    setVoucherDescription("");
  };

  return (
    <div className="Validation-Container">
      <div className="Validation-Wrapper">
        <div className="Validation-Title">
          <h2>Validate Zafran Valley Vouchers</h2>
        </div>
        <div className="Validation-Form">
          <input
            type="text"
            value={voucherNumber}
            onChange={(e) => setVoucherNumber(e.target.value)}
            placeholder="Enter Voucher Number"
          />
          <button onClick={handleValidation}>Apply</button>
          {message && <p>{message}</p>}
          {voucherDescription && (
            <p>
              {voucherDescription} Applied {/* Display the description */}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Validation;
