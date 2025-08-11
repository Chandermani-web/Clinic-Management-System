import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "remixicon/fonts/remixicon.css";
import { assigntokens } from "../Store/AssignToken.Slice.js";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../Firebase/Firebase.js";
import useFetchTokens from "../Utils/FetchAllToken.js";

const AssignToken = () => {
  // Total Token
  const tokenlist = useFetchTokens();

  // Today Token
  const today = new Date().toLocaleDateString();
  const tokenList = tokenlist.filter((token) => token.date === today);

  const [Assigntokendetails, setAssigntokendetails] = useState({
    patientname: "",
    patientage: "",
    patientphone: "",
    patientpriority: "Normal",
    patientsymptoms: "",
  });

  const database = getDatabase(app);
  const dispatch = useDispatch();

  const TokenNumber = String(tokenlist.length ? tokenlist.length + 1 : 1).padStart(3, '0');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await set(ref(database, `assigntokens/T${TokenNumber}(${Assigntokendetails.patientname})`), {
        ...Assigntokendetails,
        TokenNumber: `T${TokenNumber}`,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        active: true,
        inprogress: true,
      });

      dispatch(assigntokens({ Assigntokendetails, TokenNumber }));
      setAssigntokendetails({
        patientname: "",
        patientage: "",
        patientphone: "",
        patientpriority: "Normal",
        patientsymptoms: "",
      });
      toast.success("✅ Token Assigned Successfully", {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (error) {
      console.error("Failed to assign token:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Token Assignment</h1>
          <p className="mt-2 text-sm text-gray-500">
            Register new patients and assign consultation tokens
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                    <i className="ri-coupon-2-line text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">New Token Assignment</h2>
                    <p className="text-sm text-gray-500">Fill in patient details to assign a new token</p>
                  </div>
                </div>
              </div>

              <form className="p-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Name */}
                  <div>
                    <label htmlFor="patientname" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <i className="ri-user-line"></i>
                      </span>
                      <input
                        type="text"
                        id="patientname"
                        name="patientname"
                        value={Assigntokendetails.patientname}
                        onChange={(e) =>
                          setAssigntokendetails({
                            ...Assigntokendetails,
                            patientname: e.target.value,
                          })
                        }
                        placeholder="Enter patient's full name"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Patient Age */}
                  <div>
                    <label htmlFor="patientage" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="patientage"
                      name="patientage"
                      value={Assigntokendetails.patientage}
                      onChange={(e) =>
                        setAssigntokendetails({
                          ...Assigntokendetails,
                          patientage: e.target.value,
                        })
                      }
                      placeholder="Enter patient's age"
                      required
                      min="0"
                      max="120"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Patient Phone */}
                  <div>
                    <label htmlFor="patientphone" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <i className="ri-phone-line"></i>
                      </span>
                      <input
                        type="tel"
                        id="patientphone"
                        name="patientphone"
                        value={Assigntokendetails.patientphone}
                        onChange={(e) =>
                          setAssigntokendetails({
                            ...Assigntokendetails,
                            patientphone: e.target.value,
                          })
                        }
                        placeholder="Enter phone number"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Priority Select */}
                  <div>
                    <label htmlFor="patientpriority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="patientpriority"
                      name="patientpriority"
                      value={Assigntokendetails.patientpriority}
                      onChange={(e) =>
                        setAssigntokendetails({
                          ...Assigntokendetails,
                          patientpriority: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Symptoms Textarea */}
                <div className="mt-6">
                  <label htmlFor="patientsymptoms" className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms / Reason for Visit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 text-gray-500">
                      <i className="ri-file-list-line"></i>
                    </span>
                    <textarea
                      id="patientsymptoms"
                      name="patientsymptoms"
                      value={Assigntokendetails.patientsymptoms}
                      onChange={(e) =>
                        setAssigntokendetails({
                          ...Assigntokendetails,
                          patientsymptoms: e.target.value,
                        })
                      }
                      placeholder="Describe the symptoms or reason for consultation"
                      required
                      rows="4"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    ></textarea>
                  </div>
                </div>

                {/* Token Info */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Token Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Next Token</p>
                      <p className="font-semibold text-blue-600">T{TokenNumber}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Estimated Time</p>
                      <p className="font-semibold">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors"
                  >
                    <i className="ri-coupon-2-line mr-2"></i>
                    Assign Token
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Today's Tokens */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                    <i className="ri-time-line text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Today's Tokens</h2>
                    <p className="text-sm text-gray-500">Currently assigned tokens</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {tokenList.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="ri-inbox-line text-4xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500">No tokens assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {tokenList.map((token, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            token.patientpriority?.toLowerCase() === "urgent"
                              ? "bg-red-50 text-red-600"
                              : token.patientpriority?.toLowerCase() === "high"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-green-50 text-green-600"
                          }`}>
                            <i className="ri-coupon-2-line"></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{token.patientname}</h3>
                            <p className="text-xs text-gray-500">{token.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            token.patientpriority?.toLowerCase() === "urgent"
                              ? "bg-red-100 text-red-800"
                              : token.patientpriority?.toLowerCase() === "high"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {token.patientpriority}
                          </span>
                          <p className="text-sm font-bold text-blue-600 mt-1">{token.TokenNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AssignToken;