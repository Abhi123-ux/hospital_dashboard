import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';
import './OpdFootfall.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// import showGraph from '../../Assests/Images/showGraph.svg'

function OpdDoctorwise() {
  // const tokenNo = process.env.REACT_APP_TOKEN_NO; 
  const tokenNo = localStorage.getItem('tokenNo');
  const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    axios
      .get(`${DASHBOARD_URL}/adhocapi/dashboard/footfall/doctor?type=OP`,{
        headers: { Authorization: `Bearer ${tokenNo}`}
      })
      .then(response => {
        const responseData = response.data.data;
        const totalDates = Object.keys(responseData[0]).filter(key => key !== 'empId' && key !== 'empName');
        setDates(totalDates);
        const updatedData = responseData.map(doct => {
          const grandTotal = totalDates.reduce((total, date) => total + (doct[date] || 0), 0);
          return { ...doct, 'Grand Total': grandTotal };
        });
        setData(updatedData);
        setLoading(false); // Data fetching is complete
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false); // Stop loader in case of error
      });
  }, []);

  const handleOpenDialog = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleCloseDialog = () => {
    setSelectedDoctor(null);
  };

  const renderRows = () => {
    return data.map((row, index) => {
      return (
        <tr key={index}>
          <td>{row.empName}</td>
          {dates.map(date => (
            <td key={date}>{row[date] || '0'}</td>
          ))}
          <td>{row['Grand Total']}</td>
          <td>
            <span style={{cursor:'pointer'}} role="img" aria-label="Show Graph" onClick={() => handleOpenDialog(row)}>📊</span>
            {/* <img style={{height:'20px', width:'20px'}} src={showGraph} alt="Show Graph" onClick={() => handleOpenDialog(row)} /> */}
          </td>
        </tr>
      );
    });
  };

  const DoctorLineChart = ({ data }) => {
    return (
      <LineChart
        width={900}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="2 2" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    );
  };

  return (
    <div>
      {loading ? (
        <div className="loader-container">
          <BeatLoader color="#2190B9" />
        </div>
      ) : (
        <div>
          <table className='MainTable'>
            <thead>
              <tr>
                <th>Doctor Name</th>
                {dates.map(date => (
                  <th key={date}>{date}</th>
                ))}
                <th>Grand Total</th>
                <th>Show Graph</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>

          <Dialog maxWidth="lg" open={selectedDoctor !== null} onClose={handleCloseDialog}>
            <DialogTitle className='DialogTitle'>Graph for {selectedDoctor && selectedDoctor.empName}</DialogTitle>
            <DialogContent>
              {selectedDoctor && <DoctorLineChart data={dates.map(date => ({ date, count: selectedDoctor[date] || 0 }))} />}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default OpdDoctorwise;
