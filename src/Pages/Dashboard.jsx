import { toast, ToastContainer } from "react-toastify";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getDatabase, ref, update } from "firebase/database";
import useFetchTokens from "../Utils/FetchAllToken";
import { useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiClock, FiSearch, FiPlus, FiUsers, FiFileText } from "react-icons/fi";
import { RiStethoscopeLine, RiUserReceivedLine } from "react-icons/ri";

const db = getDatabase();

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const navigate = useNavigate();
  
  // User details
  const UserDetails = useSelector((state) => state.signin);
  const UserActiveRole = UserDetails.activeRole;

  // Patient data
  const Patients = useFetchTokens();
  const todayDate = new Date().toLocaleDateString();
  
  // Dashboard metrics
  const TotalPatients = Patients.length;
  const TodayPatients = Patients.filter(patient => patient.date === todayDate);
  const completeTodayPatients = TodayPatients.filter(patient => !patient.inprogress);
  const ActiveTokens = TodayPatients.filter(patient => patient.inprogress);
  const pendingPercentage = TodayPatients.length > 0 
    ? Math.round((ActiveTokens.length / TodayPatients.length) * 100) 
    : 0;

  // Filtered patients based on role
  const filteredPatients = Patients.filter(patient => {
    const nameMatch = patient.patientname?.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = dateFilter === "today" ? patient.date === todayDate : true;
    return nameMatch && dateMatch;
  }).sort((a, b) => (a.inprogress === b.inprogress ? 0 : a.inprogress ? -1 : 1));

  const FilterPatients = TodayPatients.filter(patient => 
    patient.inprogress && patient.patientname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const changeStatus = async (status, TokenNumber, Name) => {
    const patientRef = ref(db, `assigntokens/${TokenNumber}(${Name})`);

    try {
      await update(patientRef, {
        inprogress: status === "Active"
      });

      toast.success("✅ Token status updated successfully", {
        position: "top-right",
        autoClose: 1000,
        closeButton: true,
        closeOnClick: true,
      });
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      status === "Pending" ? "bg-amber-100 text-amber-800" :
      status === "Completed" ? "bg-green-100 text-green-800" :
      "bg-gray-100 text-gray-800"
    }`}>
      {status}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {UserActiveRole === "doctor" ? "Doctor Dashboard" : "Reception Dashboard"}
              </h1>
              <p className="text-gray-500 text-sm">
                {UserActiveRole === "doctor" 
                  ? "Manage your patients and appointments" 
                  : "Handle patient tokens and appointments"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition w-full md:w-64"
                />
              </div>
              {UserActiveRole === "doctor" && (
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="all">All Patients</option>
                  <option value="today">Today Only</option>
                </select>
              )}
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              title: "Total Patients",
              value: TotalPatients,
              icon: <FiUsers className="text-blue-500" size={20} />,
              description: "All registered patients",
              trend: "text-blue-500"
            },
            {
              title: "Today's Patients",
              value: TodayPatients.length,
              icon: <FiCalendar className="text-green-500" size={20} />,
              description: `Completed: ${completeTodayPatients.length}`,
              trend: "text-green-500"
            },
            {
              title: "Active Tokens",
              value: ActiveTokens.length,
              icon: <FiClock className="text-amber-500" size={20} />,
              description: `${pendingPercentage}% pending`,
              trend: "text-amber-500"
            }
          ].map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-bold mb-2">{card.value}</h3>
                  <p className={`text-xs ${card.trend}`}>{card.description}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Patient List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {UserActiveRole === "doctor" ? (
                      <RiStethoscopeLine className="text-blue-500" size={24} />
                    ) : (
                      <RiUserReceivedLine className="text-blue-500" size={24} />
                    )}
                    {UserActiveRole === "doctor" ? "Recent Patients" : "Active Tokens"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {UserActiveRole === "doctor" 
                      ? "View and manage patient records" 
                      : "Manage today's patient tokens"}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {(UserActiveRole === "doctor" ? filteredPatients : FilterPatients).length > 0 ? (
                (UserActiveRole === "doctor" ? filteredPatients : FilterPatients).map((patient, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                          {patient.patientname[0]}
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{patient.patientname}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">Age: {patient.patientage}</span>
                            {UserActiveRole === "doctor" && (
                              <span className="text-xs text-gray-500 truncate max-w-xs">
                                {patient.patientsymptoms}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{patient.time}</p>
                          <p className="text-xs text-gray-500">{patient.date}</p>
                        </div>
                        {UserActiveRole === "doctor" ? (
                          <button
                            onClick={() => patient.inprogress && changeStatus(
                              "InActive",
                              patient.TokenNumber,
                              patient.patientname
                            )}
                            className={`px-4 py-1 rounded-full text-xs font-medium ${
                              patient.inprogress 
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer" 
                                : "bg-green-100 text-green-800 cursor-default"
                            }`}
                          >
                            {patient.inprogress ? "Pending" : "Completed"}
                          </button>
                        ) : (
                          <StatusBadge status="Waiting" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-gray-300 mb-2">
                    {UserActiveRole === "doctor" ? (
                      <FiUser size={48} className="mx-auto" />
                    ) : (
                      <FiFileText size={48} className="mx-auto" />
                    )}
                  </div>
                  <h3 className="text-gray-500 font-medium">No patients found</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm ? "Try a different search term" : 
                    UserActiveRole === "doctor" 
                      ? "No patients scheduled for today" 
                      : "No active tokens at the moment"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Quick Actions */}
          <div className="lg:w-80 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FiPlus className="text-blue-500" />
                Quick Actions
              </h2>
              <p className="text-sm text-gray-500 mt-1">Frequently used actions</p>
            </div>
            <div className="p-4 space-y-3">
              <button 
                onClick={() => navigate("/Clinic-Management/assign-token")}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-blue-50 hover:text-blue-600 transition border border-gray-200"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiPlus />
                </div>
                <div>
                  <h3 className="font-medium">Add New Patient</h3>
                  <p className="text-xs text-gray-500">Register a new patient</p>
                </div>
              </button>
              
              <button 
                onClick={() => toast.info("Loading today's schedule...", { position: "top-right" })}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-blue-50 hover:text-blue-600 transition border border-gray-200"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiCalendar />
                </div>
                <div>
                  <h3 className="font-medium">Today's Schedule</h3>
                  <p className="text-xs text-gray-500">View daily appointments</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate("/Clinic-Management/patient-records")}
                className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-blue-50 hover:text-blue-600 transition border border-gray-200"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiUsers />
                </div>
                <div>
                  <h3 className="font-medium">Patient Reports</h3>
                  <p className="text-xs text-gray-500">View all patient records</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Dashboard;