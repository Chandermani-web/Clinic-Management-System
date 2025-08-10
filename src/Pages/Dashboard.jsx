import { toast, ToastContainer } from "react-toastify";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getDatabase, ref, update } from "firebase/database";
import useFetchTokens from "../Utils/FetchAllToken";
import { useNavigate } from "react-router-dom";

const db = getDatabase();

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const navigate = useNavigate();
  // Signin Details
  const UserDetails = useSelector((state) => state.signin);
  const UserActiveRole = UserDetails.activeRole;

  // Patient Details
  const Patients = useFetchTokens();
  const TotalPatients = Patients.length;
  const TodayPatients = Patients.filter(
    (patient) => patient.date === new Date().toLocaleDateString()
  );
  const completeTodayPatients = TodayPatients.filter(
    (patient) => patient.inprogress === false
  );
  const ActiveTokens = Patients.filter((patient) => patient.inprogress === true);

  const todayDate = new Date().toLocaleDateString();

  // Doctor Dashboard
  const filteredPatients = Patients.filter((patient) => {
    const namematch = patient.patientname
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    let dateMatch = true;
    if (dateFilter === "today") {
      dateMatch = patient.date === todayDate;
    }

    return namematch && dateMatch;
  }).sort((a, b) => (a.inprogress === b.inprogress ? 0 : a.active ? -1 : 1));

  const changestatus = async (status, TokenNumber, Name) => {
    const patientRef = ref(db, `assigntokens/${TokenNumber}(${Name})`);

    try {
      await update(patientRef, {
        inprogress: status === "Active" ? true : false,
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

  // Receptionist Dashboard

  const FilterPatients = TodayPatients.filter((patient) => {
    const namematch =
      patient.inprogress === true &&
      patient.patientname?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return namematch;
  });

  return (
    <div className="flex justify-center">
      <div className="flex flex-col py-10 xl:w-[80%] gap-6">
        {UserActiveRole === "doctor" ? (
          <div>
            <h1 className="text-2xl text-black font-bold">Doctor Dashboard</h1>
            <p className="text-zinc-400 text-xs">
              Manage your patient and appointments
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl text-black font-bold">
              Receptionist Dashboard
            </h1>
            <p className="text-zinc-400 text-xs">
              Handles patient tokens and appointments
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              heading: "Total Patients",
              value: TotalPatients,
              icon: "ri-group-line",
              last: "+12 from last month",
            },
            {
              heading: "Today Patients",
              value: TodayPatients.length,
              icon: "ri-calendar-2-line",
              last: `Completed Patient: ${completeTodayPatients.length}`,
            },
            {
              heading: "Active Tokens",
              value: ActiveTokens.length,
              icon: "ri-time-line",
              last: "Waiting...",
            },
          ].map((field, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col gap-2"
            >
              <div className="flex justify-between font-semibold text-sm text-gray-500">
                <h4 className="font-extrabold">{field.heading}</h4>
                <i className={`${field.icon} font-light text-gray-500`}></i>
              </div>
              <div className="ml-1 leading-tight">
                <h1 className={`${i === 2 ? "text-2xl font-bold text-blue-600" : "text-2xl font-semibold"}`}>{field.value}</h1>
                <p className={`${i === 1 ? "text-[11px] text-emerald-600 font-medium" : "text-[11px] text-gray-500"}`}>{field.last}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full mt-6 flex justify-between gap-6">
          {/* Left panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm xl:flex-1">
            {UserActiveRole === "doctor" ? (
              // Doctor Dashboard
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-xl font-semibold"><i className="ri-capsule-fill text-2xl text-blue-600"></i> Recent Patients</h1>
                  <p className="text-zinc-700 text-xs">
                    View and search patient records
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1 flex gap-3 border border-gray-300 bg-gray-50 rounded-lg p-2">
                      <i className="ri-search-line text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="search patient by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="outline-0 bg-transparent w-full capitalize"
                      />
                    </div>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50"
                    >
                      <option value="all">All</option>
                      <option value="today">Today</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-4">
                    {filteredPatients.map((patient, index) => (
                      <div
                        key={index}
                        className="flex justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                      >
                        {/* Left panel */}
                        <div className="flex flex-col gap-1">
                          {/* left-top panel */}
                          <div className="flex gap-3">
                            <span className="px-5 py-3 text-sm bg-blue-50 text-blue-600 rounded-full text-center font-bold">
                              {patient.patientname[0]}
                            </span>
                            <div>
                              <h2 className="text-sm capitalize">
                                {patient.patientname}
                              </h2>
                              <p className="text-xs text-gray-400">
                                Age: {patient.patientage}
                              </p>
                            </div>
                          </div>
                          {/* left-bottom panel */}
                          <div>
                            <p className="text-gray-400 text-xs">
                              {patient.patientsymptoms}
                            </p>
                          </div>
                        </div>

                        {/* Right panel */}
                        <div className="">
                          {patient.inprogress ? (
                            <h1
                              className="bg-amber-500 text-white text-xs py-1 px-4 rounded-2xl text-center cursor-pointer"
                              onClick={() => {
                                changestatus(
                                  "InActive",
                                  patient.TokenNumber,
                                  patient.patientname
                                );
                              }}
                            >
                              Pending
                            </h1>
                          ) : (
                            <h1
                              className="bg-emerald-600 text-white text-xs py-1 px-4 rounded-2xl text-center cursor-pointer"
                            >
                              Completed
                            </h1>
                          )}
                          <p className="text-xs text-gray-400">
                            Last Visit: {patient.date}
                          </p>
                        </div>
                      </div>
                    ))}
                    <ToastContainer />
                  </div>
                </div>
              </div>
            ) : (
              // Receptionist Dashboard
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-xl font-semibold"><i className="ri-token-swap-fill text-blue-600 text-2xl"></i> Patient Tokens</h1>
                  <p className="text-zinc-400 text-xs">
                    Manage today's patient tokens
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1 flex gap-3 border border-gray-300 bg-gray-50 rounded-lg p-2">
                      <i className="ri-search-line text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="search patient by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="outline-0 bg-transparent w-full capitalize"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {FilterPatients.map((patient, index) => (
                      <div
                        key={index}
                        className="flex justify-between p-3 border border-gray-200 rounded-xl items-center hover:bg-gray-50 transition"
                      >
                        {/* Left panel */}
                        <div className="flex flex-col gap-1">
                          {/* left-top panel */}
                          <div className="flex gap-2">
                            <span className="w-12 py-3 text-sm bg-blue-50 text-blue-600 text-center font-bold rounded-lg">
                              {patient.TokenNumber}
                            </span>
                            <div>
                              <h2 className="text-sm capitalize">
                                {patient.patientname}
                              </h2>
                              <p className="text-xs text-gray-400">
                                {patient.time}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right panel */}
                        <div className="">
                          {patient.inprogress ? (
                            <h1 className="bg-gray-200 text-gray-800 font-semibold text-xs py-1 px-4 rounded-2xl text-center cursor-pointer">
                              Waiting
                            </h1>
                          ) : (
                            false
                          )}
                        </div>
                      </div>
                    ))}
                    <ToastContainer />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
         <div className="bg-white w-[28%] h-[250px] flex flex-col p-4 justify-between border border-gray-200 rounded-xl shadow-sm">
            <div>
              <h1 className="text-xl font-semibold">Quick Actions</h1>
              <p className="text-zinc-400 text-[12px]">Frequently used actions</p>
            </div>
            <div className="flex flex-col gap-3">
              <button className="text-sm bg-gray-100 border p-2 rounded-xl border-gray-200 text-black flex gap-3 items-center hover:bg-blue-600 hover:text-white transition" onClick={()=>{
                navigate("/Clinic-Management/assign-token")
              }}><i className="ri-add-line"></i><span>Add New Patient</span></button>
              <button className="text-sm bg-gray-100 border p-2 rounded-xl border-gray-200 text-black flex gap-3 items-center hover:bg-blue-600 hover:text-white transition" onClick={()=>{
                toast("Loading today's Schedule...",{
                  position: "bottom-right",
                  autoClose: 2000,
                })
              }}><i className="ri-time-line"></i><span>View Today's Schedule</span></button>
              <button className="text-sm bg-gray-100 border p-2 rounded-xl border-gray-200 text-black flex gap-3 items-center hover:bg-blue-600 hover:text-white transition" onClick={()=>{
                navigate("/Clinic-Management/patient-records")
              }}><i className="ri-group-line"></i><span>Patient Reports</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
