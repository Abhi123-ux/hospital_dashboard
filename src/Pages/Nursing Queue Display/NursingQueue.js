import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import './NursingQueue.css';
import robot from '../../Assests/Images/robot.svg';
import { BeatLoader } from "react-spinners";

function NursingQueue() {
    const tokenNo = localStorage.getItem('tokenNo');
    const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [serviceCenters, setServiceCenters] = useState([]);
    const [selectedWard, setSelectedWard] = useState('');
    const [patientsData, setPatientsData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [loading, setLoading] = useState(true); // Set initial loading state to true

    useEffect(() => {
        setLoading(true); // Set loading to true when starting data fetching
        axios.get(`${DASHBOARD_URL}/adhocapi/dashboard/serviceCenters?siteId=2468`
            // , {headers: { Authorization: `Bearer ${tokenNo}` }}
        )
        .then(response => {
            setServiceCenters(response.data.data);
            setLoading(false); // Set loading to false after data fetching is complete
        })
        .catch(error => {
            console.error('Error fetching service centers:', error);
            setLoading(false); // Set loading to false if there's an error
        });
    }, []);

    useEffect(() => {
        if (selectedWard) {
            setLoading(true); // Set loading to true when starting patient data fetching
            axios.get(`${DASHBOARD_URL}/adhocapi/dashboard/nqdPatientList?siteId=2468&serviceCenterId=${selectedWard.serviceCenterId}`
                // , { headers: { Authorization: `Bearer ${tokenNo}` }}
            )
            .then(response => {
                setPatientsData(response.data.data);
                setLoading(false); // Set loading to false after data fetching is complete
            })
            .catch(error => {
                console.error('Error fetching patient data:', error);
                setLoading(false); // Set loading to false if there's an error
            });
        }
    }, [selectedWard]);

    const handleSelectChange = (e) => {
        const selectedServiceCenter = serviceCenters.find(center => center.serviceCenterName === e.target.value);
        setSelectedWard(selectedServiceCenter);
        setShowTable(true);
    };

    return (
        <div className='MainContentBox'>
            <div className='TitleLine'>
                <div className='HeaderTitleName'>
                    Nursing Queue Display
                </div>
            </div>
            <div className='ContentBox'>
                <div className="DateSearchBoxHeaderLine">
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className='SelectBarBox'>
                            <select className='searchBarInput' value={selectedWard.serviceCenterName || ''} onChange={handleSelectChange}>
                                <option value=''>Select Ward</option>
                                {serviceCenters.map(center => (
                                    <option key={center.serviceCenterId} value={center.serviceCenterName}>{center.serviceCenterName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="CalenterView">
                        <input
                            type="date"
                            style={{ color: "black", outline: "none", border: "none" }}
                            value={selectedDate.toISOString().split('T')[0]} // Set the value to the selectedDate
                            onChange={(e) => setSelectedDate(new Date(e.target.value))} // Convert the input value to a Date object and update selectedDate
                        />
                    </div>
                </div>
                {loading ? (
                    <div className="loader-container">
                        <BeatLoader
                            color={"#2190B9"}
                            loading={loading}
                            size={15}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                ) : (
                    <>
                        {!showTable && (
                            <div className='robot'>
                                <img src={robot} alt="bedIcon" className='robot-img' /><br/> 
                                <p style={{ margin: '-45px 0 0 0' }} className='.robot-text'>Select Ward to view details</p>
                            </div>
                        )}
                        {showTable && (
                            <div className='TableContainer'>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#E5E9E9", padding: '12px', fontWeight: '600' }}>
                                            <TableRow>
                                                <TableCell>Patient Details</TableCell>
                                                <TableCell>Visit & Bed Detail</TableCell>
                                                <TableCell>Admitted Doctor</TableCell>
                                                <TableCell>Department</TableCell>
                                                <TableCell>Admission Date</TableCell>
                                                <TableCell>Patient Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {patientsData.map(patient => (
                                                <TableRow key={patient.patientId}>
                                                    <TableCell>
                                                        <span className="Tablepatientname">{patient.patientName}</span>&nbsp;&nbsp;
                                                        <span className="Tablepatientgender">{patient.gender}</span>&nbsp;
                                                        <br /> <span> ☎ :{patient.mobileNo} </span> &nbsp; <span>Age : {patient.age} </span>
                                                        <br/> {patient.mrno}&nbsp;&nbsp;
                                                    </TableCell>
                                                    <TableCell><span>{patient.visitNo}</span><br /> Bed No. : {patient.bedNo}</TableCell>
                                                    <TableCell>{patient.doctorName}</TableCell>
                                                    <TableCell>{patient.departmentName}</TableCell>
                                                    <TableCell>{patient.admissionDate}</TableCell>
                                                    <TableCell>{patient.ipStatus}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NursingQueue;
