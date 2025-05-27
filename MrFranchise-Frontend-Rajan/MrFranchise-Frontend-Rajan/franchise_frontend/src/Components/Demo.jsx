// src/components/Demo.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Demo = () => {
  const [brandData, setBrandData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = useSelector((state) => state.auth.AccessToken);
  const investorUUID = useSelector((state) => state.auth.investorUUID);
  console.log("investorUUID :",investorUUID)

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!token || !investorUUID) {
        setError('Missing authentication token or brand ID. Please login.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/investor/getInvestorByUUID/${investorUUID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true, // Include cookies if used by backend
          }
        );
        setBrandData(response.data);
      } catch (err) {
        console.error('API Error:', err);
        setError(
          err.response?.data?.message ||
          'An error occurred while fetching brand data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [token, investorUUID]);

  return (
    <div>
      <h2>Brand Info</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading brand data...</p>
      ) : brandData ? (
        <pre>{JSON.stringify(brandData, null, 2)}</pre>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default Demo;
