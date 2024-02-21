import React, { useState, useEffect } from "react";
import "./DoctorVisibility.css";
import searchIcon from "../../Assests/Images/searchIcon.svg";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import axios from "axios";
import { HashLoader } from "react-spinners";

function DoctorVisibility() {

  const tokenNo=process.env.REACT_APP_TOKEN_NO;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Set initial loading state to true
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Set initial date to today's date

  function formatDate(dateTimeString) {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    const formattedDateTime = new Date(dateTimeString).toLocaleDateString('en-GB', options);
    return formattedDateTime;
  }
  
  useEffect(() => {
    setLoading(true); // Set loading to true when starting data fetching
    axios
      .get(`http://localhost:9191/adhocapi/dashboard/fetchOpIpList?date=${formatDate(selectedDate)}`,{
        headers: { Authorization: `Bearer ${tokenNo}`}
      })
      .then((response) => {
        setData(response.data.data);
        setLoading(false); // Set loading to false after data fetching is complete
        setFilteredData(response.data.data); // Initialize filtered data with fetched data
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false if there's an error
      });
  },[selectedDate]);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    filterData(e.target.value);
  };

  const filterData = (query) => {
    if (!query) {
      setFilteredData(data); // If no query, show all data
      return;
    }
    const filtered = data.filter((item) =>
      item.doctorName.toLowerCase().includes(query.toLowerCase()) ||
      item.departmentName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleTableRowClick = (doctorName, departmentName) => {
    setSearchQuery(`${doctorName}, ${departmentName}`);
  };

  return (
    <div className="MainContentBox">
      <div className="TitleLine">
        <div className="HeaderTitleName">Doctor Visibility</div>
      </div>

      <div className="ContentBox">
        <div className="DateSearchBoxHeaderLine">
          <div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className='searchBarBox'>
              <input className='searchBarInput' placeholder='Search Doctor / Department' onChange={handleSearchChange} />
              <img style={{ cursor: "pointer" }} src={searchIcon} alt="search" />
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

        <div className="TableContainer">
          <div className="loader-container" >
            <HashLoader
              color={"#2190B9"}
              loading={loading}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
          {!loading && (
            <Table>
              <TableHead sx={{ backgroundColor: "#E5E9E9" }}>
                <TableRow>
                  <TableCell>Doctor Name</TableCell>
                  {/* <TableCell>Doctor Id</TableCell> */}
                  <TableCell>Department</TableCell>
                  <TableCell>OP consultation</TableCell>
                  <TableCell>IP consultation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ overflowY: "auto" }}>
                {filteredData.map((row, index) => (
                  <TableRow key={index} onClick={() => handleTableRowClick(row.doctorName, row.departmentName)}>
                    <TableCell>{row.doctorName}</TableCell>
                    {/* <TableCell>{row.doctorId}</TableCell> */}
                    <TableCell>{row.departmentName}</TableCell>
                    <TableCell>{row.opCount}</TableCell>
                    <TableCell>{row.ipCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorVisibility;
