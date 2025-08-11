import { toast, ToastContainer } from "react-toastify";
import React, { useMemo, useState } from "react";
import useFetchTokens from "../Utils/FetchAllToken.js";
import { getDatabase, ref, update, get, child } from "firebase/database";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const db = getDatabase();

const PatientRecords = () => {
  const tokenList = useFetchTokens();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Status calculations
  const totalPatients = tokenList.length;
  const activeCount = tokenList.filter(p => p.active && !p.inprogress).length;
  // const inactiveCount = tokenList.filter(p => !p.active).length;
  const pendingCount = tokenList.filter(p => p.inprogress).length;
  const completedCount = tokenList.filter(p => p.active && !p.inprogress && p.date !== new Date().toLocaleDateString()).length;
  
  const todayDate = new Date().toLocaleDateString();
  const todayPatients = tokenList.filter(d => d.date === todayDate);
  const todayPendingCount = todayPatients.filter(p => p.inprogress).length;
  const previousPendingCount = pendingCount - todayPendingCount;

  const last7Days = useMemo(() => {
    const days = [];
    const formatter = new Intl.DateTimeFormat(undefined);
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(formatter.format(d));
    }
    return days;
  }, []);

  const tokensPerDay = useMemo(() => {
    return last7Days.map(d => ({
      date: d,
      total: tokenList.filter(t => t.date === d).length,
      pending: tokenList.filter(t => t.date === d && t.inprogress).length,
      completed: tokenList.filter(t => t.date === d && !t.inprogress && !t.active).length
    }));
  }, [last7Days, tokenList]);

  const barData = useMemo(() => ({
    labels: last7Days,
    datasets: [
      {
        label: "Completed",
        data: tokensPerDay.map(d => d.completed),
        backgroundColor: "rgba(16, 185, 129, 1)",
        borderRadius: 4,
        borderWidth: 0
      },
      {
        label: "Pending",
        data: tokensPerDay.map(d => d.pending),
        backgroundColor: "rgba(234, 179, 8, 1)",
        borderRadius: 4,
        borderWidth: 0
      },
      {
        label: "Active",
        data: tokensPerDay.map(d => d.total - d.pending - d.completed),
        backgroundColor: "rgba(59, 130, 246, 1)",
        borderRadius: 4,
        borderWidth: 0
      }
    ]
  }), [last7Days, tokensPerDay]);

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: { 
        mode: 'index',
        intersect: false
      },
    },
    scales: {
      x: { 
        stacked: true,
        // grid: { display: false } 
      },
      y: { 
        stacked: true,
        grid: { color: "#f4f4f5" }, 
        ticks: { stepSize: 1, precision: 0 } 
      },
    },
    maintainAspectRatio: false
  };

  const statusData = {
    labels: ["Active", "Completed", "Pending Today", "Previous Pending"],
    datasets: [
      {
        data: [activeCount, completedCount, todayPendingCount, previousPendingCount],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", 
          "rgba(16, 185, 129, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(245, 158, 11, 0.8)"
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)", 
          "rgba(16, 185, 129, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(245, 158, 11, 1)"
        ],
        borderWidth: 1,
      },
    ],
  };

  const filteredPatients = tokenList.filter((patient) => {
    const nameMatch = patient.patientname
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    let statusMatch = true;
    if (statusFilter === "active") {
      statusMatch = patient.active && !patient.inprogress;
    } else if (statusFilter === "inactive") {
      statusMatch = !patient.active;
    } else if (statusFilter === "pending") {
      statusMatch = patient.inprogress;
    } else if (statusFilter === "completed") {
      statusMatch = !patient.active && !patient.inprogress;
    }

    return nameMatch && statusMatch;
  });

  const changeStatus = async (status, TokenNumber, Name) => {
    const patientRef = ref(db, `assigntokens/${TokenNumber}(${Name})`);
    const billsClearRef = child(patientRef, "bills");

    try {
      const snapshot = await get(billsClearRef);

      if (snapshot.exists()) {
        await update(patientRef, {
          active: status === "Active",
          inprogress: false // Mark as not in progress when changing status
        });

        toast.success("✅ Patient status updated successfully!", {
          position: "top-right",
          autoClose: 1000,
          closeButton: true,
          closeOnClick: true,
        });
      } else {
        toast.error("⚠️ Please clear all bills before marking as completed");
      }
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    }
  };

  const getStatusBadge = (patient) => {
    if (patient.inprogress) {
      return {
        text: "In Progress",
        color: "bg-yellow-500 hover:bg-yellow-600",
        icon: "ri-loader-4-line"
      };
    }
    if (patient.active) {
      return {
        text: "Active",
        color: "bg-blue-600 hover:bg-blue-700",
        icon: "ri-play-circle-line"
      };
    }
    return {
      text: "Completed",
      color: "bg-green-600 hover:bg-green-700",
      icon: "ri-checkbox-circle-line"
    };
  };

  return (
    <div className="flex justify-center bg-gray-50 min-h-screen">
      <div className="flex flex-col py-8 xl:w-[90%] gap-6 px-4">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">Patient Records Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Comprehensive overview of patient statuses and treatment progress
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Patients",
              value: totalPatients,
              icon: "ri-group-line",
              color: "from-indigo-500 to-blue-500",
              trend: null
            },
            {
              label: "Active",
              value: activeCount,
              icon: "ri-play-circle-line",
              color: "from-blue-500 to-cyan-500",
              trend: "ri-arrow-up-line text-blue-500"
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: "ri-loader-4-line",
              color: "from-amber-400 to-yellow-500",
              trend: todayPendingCount > 0 ? "ri-arrow-up-line text-amber-500" : "ri-arrow-down-line text-green-500"
            },
            {
              label: "Completed",
              value: completedCount,
              icon: "ri-checkbox-circle-line",
              color: "from-green-500 to-emerald-600",
              trend: "ri-arrow-up-line text-green-500"
            }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color} text-white`}>
                  <i className={`${kpi.icon} text-xl`}></i>
                </div>
              </div>
              {kpi.trend && (
                <div className="mt-3 flex items-center text-sm">
                  <i className={`${kpi.trend} mr-1`}></i>
                  <span className="text-gray-500">Today: {
                    kpi.label === "Pending" ? todayPendingCount : 
                    kpi.label === "Active" ? activeCount - todayPendingCount : 
                    completedCount
                  }</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Patients Trend Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Treatment Status Trend (7 days)
              </h3>
              <div className="flex space-x-2">
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                  Active
                </span>
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                  Pending
                </span>
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  Completed
                </span>
              </div>
            </div>
            <div className="h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Status Distribution Chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut 
                data={statusData} 
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20
                      }
                    }
                  },
                  cutout: '70%'
                }} 
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="bg-blue-50 p-2 rounded-lg">
                <p className="text-blue-800 font-bold">{activeCount}</p>
                <p className="text-xs text-blue-600">Active</p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <p className="text-green-800 font-bold">{completedCount}</p>
                <p className="text-xs text-green-600">Completed</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded-lg">
                <p className="text-yellow-800 font-bold">{todayPendingCount}</p>
                <p className="text-xs text-yellow-600">Pending Today</p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg">
                <p className="text-amber-800 font-bold">{previousPendingCount}</p>
                <p className="text-xs text-amber-600">Previous Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  <i className="ri-database-2-line mr-2 text-blue-500"></i>
                  Patient Records
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Showing {filteredPatients.length} of {totalPatients} patients
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bills</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient, index) => {
                    const status = getStatusBadge(patient);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.TokenNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {patient.patientname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {patient.patientage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {patient.patientphone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {patient.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center max-w-xs truncate">
                          {patient.patientsymptoms}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {patient.bills ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Clear
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() => {
                              navigate("/Clinic-Management/patientdetails", {
                                state: {
                                  patientId: patient.TokenNumber,
                                  patientName: patient.patientname,
                                },
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <button
                            onClick={() => {
                              if (!patient.inprogress) {
                                changeStatus(
                                  patient.active ? "Inactive" : "Active",
                                  patient.TokenNumber,
                                  patient.patientname
                                );
                              }
                            }}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${status.color} transition ${patient.inprogress ? 'cursor-not-allowed opacity-90' : 'hover:shadow-md'}`}
                            disabled={patient.inprogress}
                          >
                            <i className={`${status.icon} mr-1`}></i>
                            {status.text}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No patients found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong className="font-semibold text-blue-600">Note:</strong> 
              {" "}Pending cases cannot be modified until completed. Clear all bills to mark a case as completed.
            </p>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default PatientRecords;