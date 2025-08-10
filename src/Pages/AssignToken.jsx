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
  const tokenList = tokenlist.filter((token) => token.date === today);;

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
    <div className="flex justify-center">
      <div className="flex flex-col py-10 xl:w-[80%] gap-6">
        <h1 className="text-2xl text-black font-bold">Assign Patient Token</h1>
        <p className="text-zinc-400 text-xs">
          Register new patients and assign them consultation tokens
        </p>
        <div className="mt-2 gap-6 flex">
          {/* Left Panel */}
          <div className="border border-gray-200 bg-white w-2/3 rounded-xl p-5 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold">
                <i className="ri-coupon-2-line text-blue-500"></i> New Token Assignment
              </h1>
              <p className="text-zinc-600 text-xs">
                Fill in patient details to assign a new consultation token
              </p>
            </div>
            <form className="grid grid-cols-2 gap-4 mt-5" onSubmit={handleSubmit}>
              {[
                {
                  label: "Patient Name*",
                  icon: "ri-user-line",
                  id: "patientname",
                  type: "text",
                  placeholder: "Enter patient's full name",
                },
                {
                  label: "Patient Age*",
                  id: "patientage",
                  type: "number",
                  placeholder: "Enter patient's Age",
                },
                {
                  label: "Patient Phone*",
                  id: "patientphone",
                  type: "text",
                  placeholder: "Enter patient's Phone Number",
                },
              ].map((field, i) => (
                <div className="flex flex-col" key={i}>
                  <label className="text-sm p-1 font-semibold" htmlFor={field.id}>
                    {field.icon && <i className={`${field.icon}`}></i>} {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    value={Assigntokendetails[field.id]}
                    onChange={(e) =>
                      setAssigntokendetails({
                        ...Assigntokendetails,
                        [field.id]: e.target.value,
                      })
                    }
                    placeholder={field.placeholder}
                    required
                    className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                  />
                </div>
              ))}

              {/* Priority Select */}
              <div className="flex flex-col">
                <label className="text-sm p-1 font-semibold" htmlFor="patientpriority">
                  Priority*
                </label>
                <select
                  name="patientpriority"
                  id="patientpriority"
                  value={Assigntokendetails.patientpriority}
                  onChange={(e) =>
                    setAssigntokendetails({
                      ...Assigntokendetails,
                      patientpriority: e.target.value,
                    })
                  }
                  className="bg-gray-50 text-sm py-2 px-3 rounded-lg outline-0 border border-gray-200 focus:border-blue-500"
                  required
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Symptoms Textarea */}
              <div className="col-span-2 flex flex-col">
                <label className="text-sm p-1 font-semibold" htmlFor="patientsymptoms">
                  <i className="ri-file-list-line"></i> Symptoms / Reason for Visit*
                </label>
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
                  className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500 h-24"
                  required
                ></textarea>
              </div>

              {/* Token Info */}
              <div className="col-span-2 flex flex-col justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 font-semibold">
                <h1 className="text-sm">Token Information</h1>
                <div className="flex justify-between px-6">
                  <p className="text-sm text-gray-400">
                    Next Token:{" "}
                    <span className="font-semibold text-black">T{TokenNumber}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Estimated Time:{" "}
                    <span className="font-semibold text-black">
                      {new Date(Date.now()).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-span-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <i className="ri-coupon-2-line mr-4"></i> Assign Token
                </button>
              </div>
            </form>
            <ToastContainer />
          </div>

          {/* Right Panel: Today's Tokens */}
          <div className="border border-gray-200 rounded-xl bg-white w-1/3 p-4 overflow-auto h-[500px] shadow-sm">
            <div>
              <h1 className="text-xl text-black font-semibold">
                <i className="ri-time-line text-blue-600"></i> Today's Tokens
              </h1>
              <p className="text-[13px] text-gray-500 mb-4">
                Currently assigned Tokens
              </p>

              {tokenList.length === 0 ? (
                <p className="text-gray-400">No tokens assigned yet.</p>
              ) : (
                tokenList.map((token, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border border-gray-200 rounded-2xl mb-2 hover:bg-gray-50 transition"
                  >
                    <div>
                      <h1 className="font-semibold text-blue-700">
                        {token.TokenNumber}
                      </h1>
                      <p className=" text-black capitalize text-sm">
                        {token.patientname}
                      </p>
                      <p className="text-xs text-gray-500">{token.time}</p>
                    </div>
                    <div className="flex flex-col gap-5">
                      <h6
                        className={`border-1 text-white font-semibold rounded-2xl px-1.5 py-1 text-center text-sm ${
                          token.patientpriority?.toLowerCase() === "urgent"
                            ? "bg-red-500"
                            : token.patientpriority?.toLowerCase() === "high"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      >
                        {token.patientpriority}
                      </h6>
                      <span className="text-xs text-gray-500">{token.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignToken;
