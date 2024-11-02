// src/components/VoucherList.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const vouchersRef = collection(db, "vouchers");
        const snapshot = await getDocs(vouchersRef);
        const fetchedVouchers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVouchers(fetchedVouchers);
      } catch (err) {
        setError("Failed to fetch vouchers.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) {
    return <p>Loading vouchers...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Available Vouchers</h2>
      {vouchers.length === 0 ? (
        <p>No vouchers available.</p>
      ) : (
        <ul>
          {vouchers.map((voucher) => (
            <li key={voucher.id}>
              <strong>Voucher Number:</strong> {voucher.number} -{" "}
              <strong>Status:</strong> {voucher.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VoucherList;
