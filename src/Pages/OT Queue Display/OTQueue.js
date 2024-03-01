import React, { useState, useEffect } from 'react';
import './OTQueue.css';
import bedIcon from '../../Assests/Images/bedIcon.svg';
import otIcon from '../../Assests/Images/otIcon.svg';
import robot from '../../Assests/Images/robot.svg';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import axios from 'axios';

function OTQueue() {
  const tokenNo = process.env.REACT_APP_TOKEN_NO;
  const [otRooms, setOtRooms] = useState([]);
  const [selectedOt, setSelectedOt] = useState('');
  const [otPatients, setOtPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    // Fetch OT rooms data
    axios
      .get(`http://localhost:9191/adhocapi/dashboard/fetchOtList?siteId=2468`, {
        headers: { Authorization: `Bearer ${tokenNo}` },
      })
      .then((response) => {
        setOtRooms(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching OT rooms data:', error);
      });
  }, [tokenNo]);

  useEffect(() => {
    // Fetch OT patients data based on selected OT room
    if (selectedOt && selectedDate) {
      axios
        .get(
          `http://localhost:9191/adhocapi/dashboard/fetchOtPatientList?serviceCenterId=${selectedOt}&date=${formatDate(selectedDate)}`,
          {
            headers: { Authorization: `Bearer ${tokenNo}` },
          }
        )
        .then((response) => {
          setOtPatients(response.data.data);
          setShowTable(true); // Show the table when OT and date are selected
        })
        .catch((error) => {
          console.error('Error fetching OT patients data:', error);
        });
    } else {
      setShowTable(false); // Hide the table when either OT or date is not selected
    }
  }, [selectedOt, selectedDate, tokenNo]);

  const handleSearchChange = (e) => {
    setSelectedOt(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  // Function to format the date as dd-MM-yyyy
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="MainContentBox">
      <div className="TitleLine">
        <div className="HeaderTitleName">OT Queue Display</div>
      </div>
      <div className="ContentBox">
        <div className="ot-seach">
          <div className="ot-inputfield">
            <select className="department-select" onChange={handleSearchChange} value={selectedOt}>
              <option value="" disabled>
                Select OT
              </option>
              {otRooms.map((room, index) => (
                <option key={index} value={room.serviceCenterId}>
                  {room.serviceCenterName}
                </option>
              ))}
            </select>
          </div>
          <div className='calender-conatiner'>
            <div className="CalenterView">
              <input
                type="date"
                style={{ color: "black", outline: "none", border: "none" }}
                value={selectedDate.toISOString().split('T')[0]} // Set the value to the selectedDate
                onChange={handleDateChange} // Update selectedDate
              />
            </div>
          </div>
        </div>

        {/* Conditional rendering of the robot image and text */}
        {!showTable && (
          <div className='robot'>
            <img src={robot} alt="bedIcon" className='robot-img' /><br/> 
            <p style={{ margin: '-45px 0 0 0' }} className='.robot-text'>Select OT and date to view details</p>
          </div>
        )}

        {/* Conditional rendering of the table */}
        {showTable && (
          <div className="TableContainer">
            <Table>
              <TableHead sx={{ backgroundColor: '#E5E9E9' }}>
                <TableRow>
                  <TableCell style={{ width: '260px' }}>Patient Details</TableCell>
                  <TableCell style={{ width: '200px' }}>Visit & Bed Details</TableCell>
                  <TableCell style={{ width: '200px' }}>Surgery Details</TableCell>
                  <TableCell style={{ width: '240px' }}>OT Team</TableCell>
                  <TableCell>Surgery Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ overflowY: 'auto' }}>
                {otPatients.map((patient, index) => (   
                  <TableRow key={index}>
                    <TableCell style={{fontSize:'12px'}} className='table-data'>
                      <span className="patientname">{patient.patientName}</span>&nbsp;
                      <span className="patientgender">{patient.gender}</span>&nbsp;
                      <span>({patient.dob})</span>
                      <br />
                      {patient.mrno}&nbsp;&nbsp;
                    </TableCell>
                    <TableCell style={{fontSize:'12px'}} className='table-data'>
                      {patient.patientVisitId}
                      <br />
                      <img src={bedIcon} alt="bedIcon" />&nbsp;{patient.bedDetails}&nbsp;{patient.patientLocation}
                    </TableCell>
                    <TableCell style={{fontSize:'12px'}} className='table-data'>
                      {patient.surgeryName}
                      <br />
                      {/* <img src={otIcon} alt="bedIcon" />&nbsp;{patient.otDetails} */}
                    </TableCell>
                   
                    <TableCell style={{fontSize:'12px'}} className='table-data'>
                      Chief Surgeon: {patient.surgeon}
                      <br />
                      Anesthetist: {patient.AnesthetistName}
                    </TableCell>
                    <TableCell style={{fontSize:'12px'}} className='table-data'>{patient.surgeryStatus}<br/>{patient.financeClearance}<br/>{patient.pacStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OTQueue;
