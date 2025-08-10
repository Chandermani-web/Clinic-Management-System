import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Icons (you can use react-icons or your preferred icon library)
import { 
  FiUser, FiCalendar, FiClock, FiPhone, FiAlertCircle, 
  FiDollarSign, FiPieChart, FiFileText, FiPlusCircle 
} from "react-icons/fi";
import { GiMedicinePills } from "react-icons/gi";
import { MdOutlineMedicalServices } from "react-icons/md";

const db = getDatabase();

const PatientDetails = () => {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [expandedBills, setExpandedBills] = useState({});
  const location = useLocation();
  const patientId = location.state?.patientId;
  const patientName = location.state?.patientName;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const patientRef = ref(db, `assigntokens/${patientId}(${patientName})`);
        const snapshot = await get(patientRef);
        if (snapshot.exists()) {
          setPatient(snapshot.val());
        } else {
          toast.error("Patient not found");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching patient details");
      }
    };

    fetchPatient();
  }, [patientId, patientName]);

  const toggleBillExpand = (billId) => {
    setExpandedBills(prev => ({
      ...prev,
      [billId]: !prev[billId]
    }));
  };

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
          </div>
          <p className="text-lg text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Patient <span className="text-blue-600">Records</span>
          </h1>
          <div className="flex items-center space-x-2 text-gray-500">
            <span>Patient ID: {patientId}</span>
            <span className="text-gray-300">•</span>
            <span className={`px-2 py-1 text-xs rounded-full ${patient.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {patient.active ? "Active" : "Inactive"}
            </span>
          </div>
        </header>

        {/* Patient Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-600 p-4 text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <FiUser size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{patient.patientname}</h2>
                <p className="text-blue-100">{patient.patientage} years • {patient.patientphone}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-6 py-3 font-medium text-sm ${activeTab === "general" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                General Info
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`px-6 py-3 font-medium text-sm ${activeTab === "billing" ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Billing History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "general" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="flex items-center text-gray-700 font-medium mb-3">
                      <FiCalendar className="mr-2 text-blue-500" />
                      Appointment Details
                    </h3>
                    <div className="space-y-2">
                      <DetailItem icon={<FiFileText />} label="Token Number" value={patient.TokenNumber} />
                      <DetailItem icon={<FiCalendar />} label="Date" value={patient.date} />
                      <DetailItem icon={<FiClock />} label="Time" value={patient.time} />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="flex items-center text-gray-700 font-medium mb-3">
                      <FiAlertCircle className="mr-2 text-blue-500" />
                      Medical Information
                    </h3>
                    <div className="space-y-2">
                      <DetailItem icon={<MdOutlineMedicalServices />} label="Priority" value={patient.patientpriority} />
                      <DetailItem icon={<GiMedicinePills />} label="Symptoms" value={patient.patientsymptoms} />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="flex items-center text-gray-700 font-medium mb-3">
                      <FiUser className="mr-2 text-blue-500" />
                      Personal Details
                    </h3>
                    <div className="space-y-2">
                      <DetailItem icon={<FiUser />} label="Name" value={patient.patientname} />
                      <DetailItem icon={<FiUser />} label="Age" value={patient.patientage} />
                      <DetailItem icon={<FiPhone />} label="Phone" value={patient.patientphone} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {patient.bills ? (
                  Object.entries(patient.bills).map(([billId, bill]) => (
                    <div key={billId} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => toggleBillExpand(billId)}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <FiDollarSign className="text-blue-500 mr-3" />
                          <div>
                            <h3 className="font-medium text-left">Bill #{bill.billNumber}</h3>
                            <p className="text-sm text-gray-500">{bill.billDate} • {bill.billTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="font-bold mr-2">₹{bill.totalAmount}</span>
                          <FiPlusCircle className={`transition-transform ${expandedBills[billId] ? 'rotate-45' : ''}`} />
                        </div>
                      </button>
                      
                      {expandedBills[billId] && (
                        <div className="p-4 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <DetailItem label="Consultation Fee" value={`₹${bill.consultationFee}`} />
                            <DetailItem label="Discount" value={`${bill.discountPercent}% (₹${bill.discountAmount})`} />
                            <DetailItem label="Payment Method" value={bill.paymentMethod} />
                            <DetailItem label="Next Appointment" value={bill.nextdate || 'Not scheduled'} />
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 flex items-center">
                              <FiPieChart className="mr-2" />
                              Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-2 bg-blue-50 p-3 rounded-lg">
                              <div className="text-right font-medium">Subtotal:</div>
                              <div>₹{bill.subtotal}</div>
                              <div className="text-right font-medium">Medicines:</div>
                              <div>₹{bill.medicinesTotal}</div>
                              <div className="text-right font-bold text-blue-600">Total:</div>
                              <div className="font-bold text-blue-600">₹{bill.totalAmount}</div>
                            </div>
                          </div>
                          
                          {bill.medicines && bill.medicines.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <GiMedicinePills className="mr-2" />
                                Prescribed Medicines
                              </h4>
                              <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {bill.medicines.map((med, idx) => (
                                      <tr key={idx}>
                                        <td className="px-4 py-2 whitespace-nowrap">{med.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right">{med.quantity}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right">₹{med.lineTotal}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FiDollarSign className="mx-auto text-gray-300" size={48} />
                    <p className="mt-2 text-gray-500">No billing history found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

// Reusable DetailItem component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start">
    {icon && <span className="mr-2 mt-1 text-gray-400">{icon}</span>}
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || '—'}</p>
    </div>
  </div>
);

export default PatientDetails;