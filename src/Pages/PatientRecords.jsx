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

  const totalPatients = tokenList.length;
  const activeCount = tokenList.filter((p) => p.active).length;
  const inactiveCount = totalPatients - activeCount;

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
    const counts = last7Days.map(
      (d) => tokenList.filter((t) => t.date === d).length
    );
    return counts;
  }, [last7Days, tokenList]);

  const barData = useMemo(
    () => ({
      labels: last7Days,
      datasets: [
        {
          label: "Patients (last 7 days)",
          data: tokensPerDay,
          backgroundColor: "rgba(37, 99, 235, 0.6)",
          borderRadius: 10,
        },
      ],
    }),
    [last7Days, tokensPerDay]
  );

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f4f4f5" }, ticks: { stepSize: 1, precision: 0 } },
    },
  };

  const statusData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [activeCount, inactiveCount],
        backgroundColor: ["#16a34a", "#9ca3af"],
        borderWidth: 0,
      },
    ],
  };

  const filteredPatients = tokenList.filter((patient) => {
    const namematch = patient.patientname
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? patient.active
        : !patient.active;

    return namematch && statusMatch;
  });

  const changestatus = async (status, TokenNumber, Name) => {
    const patientRef = ref(db, `assigntokens/${TokenNumber}(${Name})`);
    const billsClearRef = child(patientRef, "bills");

    try {
      const snapshot = await get(billsClearRef);

      if (snapshot.exists()) {
        await update(patientRef, {
          active: status === "Active" ? true : false,
        });

        toast.success("✅ Patient marked as inactive — bills cleared!", {
          position: "top-right",
          autoClose: 1000,
          closeButton: true,
          closeOnClick: true,
        });
      } else {
        toast.error("⚠️ Please clear all the bills before marking inactive");
      }
    } catch (error) {
      toast.error(`❌ ${error.message}`);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col py-10 xl:w-[80%] gap-6">
        <div>
          <h1 className="text-2xl text-black font-bold">Patient Records</h1>
          <p className="text-zinc-400 text-xs">
            Manage patient information, visit history, and prescriptions.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Patients",
              value: totalPatients,
              icon: "ri-group-line",
              color: "from-blue-500 to-indigo-500",
            },
            {
              label: "Active",
              value: activeCount,
              icon: "ri-play-circle-line",
              color: "from-emerald-500 to-green-600",
            },
            {
              label: "Inactive",
              value: inactiveCount,
              icon: "ri-pause-circle-line",
              color: "from-gray-400 to-gray-500",
            },
          ].map((kpi, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
                </div>
                <div
                  className={`p-3 rounded-full bg-gradient-to-br ${kpi.color} text-white`}
                >
                  <i className={`${kpi.icon} text-xl`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Patients Trend (7 days)
              </h3>
            </div>
            <Bar data={barData} options={barOptions} height={120} />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Status Split
              </h3>
            </div>
            <div className="h-[220px] flex items-center justify-center">
              <Doughnut data={statusData} />
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white w-full mt-2 border border-gray-200 p-4 rounded-xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-col md:flex-row">
            <div>
              <h1 className="text-lg font-semibold">
                <i className="ri-file-text-line"></i> Patient Database
              </h1>
              <p className="text-zinc-500 text-xs">
                View and manage patient information
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <div className="flex-1 flex gap-3 border border-gray-300 bg-gray-50 rounded-lg p-2">
                <i className="ri-search-line text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search patient by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="outline-0 bg-transparent w-full capitalize"
                />
              </div>
              <div className="border border-gray-300 px-3 py-2 bg-gray-50 rounded-lg text-gray-700 flex gap-2 items-center">
                <i className="ri-filter-line"></i>
                <select
                  className="outline-0 bg-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-8 py-3 text-gray-500 text-[11px] font-semibold">
                <h3 className="text-left">Patient Name</h3>
                <h3 className="text-center">Age</h3>
                <h3 className="text-center">Phone</h3>
                <h3 className="text-center">Last Visit</h3>
                <h3 className="text-center">Condition</h3>
                <h3 className="text-center">Bills</h3>
                <h3 className="text-center">View</h3>
                <h3 className="text-center">Status</h3>
              </div>
              <hr className="border-gray-200" />
              {filteredPatients.map((patient, index) => (
                <div key={index} className="">
                  <div className="grid grid-cols-8 items-center py-3 text-xs font-semibold">
                    <h3 className="text-left truncate capitalize">
                      {patient.patientname}
                    </h3>
                    <h3 className="text-center">{patient.patientage}</h3>
                    <h3 className="text-center truncate">
                      {patient.patientphone}
                    </h3>
                    <h3 className="text-center">{patient.date}</h3>
                    <h3 className="text-center truncate">
                      {patient.patientsymptoms}
                    </h3>
                    {/* It show the clear when it was false because bills slip is present in the database */}
                    <div className="text-center">
                      {patient.bills ? (
                        <h3 className="font-bold text-green-600">Clear</h3>
                      ) : (
                        <h3 className="font-bold text-red-600">Pending</h3>
                      )}
                    </div>

                    <h3
                      className="text-center text-sm"
                      onClick={() => {
                        navigate("/Clinic-Management/patientdetails", {
                          state: {
                            patientId: patient.TokenNumber,
                            patientName: patient.patientname,
                          },
                        });
                      }}
                    >
                      <i class="ri-eye-line"></i>
                    </h3>

                    <div className="text-center">
                      {patient.active ? (
                        <button
                          className="inline-flex items-center gap-1 bg-emerald-600 text-white py-1 px-3 cursor-pointer rounded-2xl hover:bg-emerald-700 transition"
                          onClick={() =>
                            changestatus(
                              "InActive",
                              patient.TokenNumber,
                              patient.patientname
                            )
                          }
                        >
                          <span className="h-2 w-2 rounded-full bg-white"></span>
                          Active
                        </button>
                      ) : (
                        <button className="inline-flex items-center gap-1 bg-gray-300 text-gray-800 py-1 px-3 cursor-pointer rounded-2xl hover:bg-gray-400 transition">
                          <span className="h-2 w-2 rounded-full bg-gray-800"></span>
                          Inactive
                        </button>
                      )}
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                </div>
              ))}
              <p className="text-xs mt-5 flex justify-end gap-2 py-2 px-3 rounded-lg">
                <strong className="font-semibold text-blue-800">Note:</strong>
                <span>
                  If you see any bills cleared but status is active, click on
                  the status to toggle to inactive
                </span>
              </p>
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
