import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDatabase, ref, push, set } from "firebase/database";
import { app } from "../Firebase/Firebase";
import useFetchTokens from "../Utils/FetchAllToken.js";
import 'remixicon/fonts/remixicon.css';

const CreateBill = () => {
  const Totaltoken = useSelector((state) => state.token.token);
  const TokenNumber = Totaltoken.length ? Totaltoken.length + 1 : 1;
  const db = getDatabase(app);
  const tokenList = useFetchTokens();

  // Form states
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [medicineInput, setMedicineInput] = useState({
    name: "",
    quantity: 1,
    rate: "",
  });
  const [medicines, setMedicines] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [nextdate, setNextDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Derived calculations
  const medicinesTotal = useMemo(() => {
    return medicines.reduce((sum, med) => {
      const qty = Number(med.quantity) || 0;
      const rate = Number(med.rate) || 0;
      return sum + qty * rate;
    }, 0);
  }, [medicines]);

  const subtotal = useMemo(() => {
    const consult = Number(consultationFee) || 0;
    return consult + medicinesTotal;
  }, [consultationFee, medicinesTotal]);

  const discountAmount = useMemo(() => {
    return (subtotal * (Number(discountPercent) || 0)) / 100;
  }, [subtotal, discountPercent]);

  const totalAmount = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  // Handlers
  const handleMedicineInputChange = (field, value) => {
    setMedicineInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addMedicine = (e) => {
    e.preventDefault();
    if (!medicineInput.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (!medicineInput.quantity || Number(medicineInput.quantity) <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (!medicineInput.rate || Number(medicineInput.rate) <= 0) {
      toast.error("Rate must be positive");
      return;
    }
    setMedicines((prev) => [
      ...prev,
      {
        name: medicineInput.name.trim(),
        quantity: Number(medicineInput.quantity),
        rate: Number(medicineInput.rate),
      },
    ]);
    setMedicineInput({ name: "", quantity: 1, rate: "" });
  };

  const deleteMedicine = (index) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName.trim() || !patientId.trim()) {
      toast.error("Patient name and ID are required.");
      return;
    }
    if (!consultationFee) {
      toast.error("Consultation fee is required.");
      return;
    }
    
    setSaving(true);
    if(tokenList.find((f)=> f.TokenNumber === patientId)){
    try {
      const billData = {
        consultationFee: Number(consultationFee) || 0,
        medicines: medicines.map((m) => ({
          name: m.name,
          quantity: m.quantity,
          rate: m.rate,
          lineTotal: m.quantity * m.rate,
        })),
        medicinesTotal,
        subtotal,
        discountPercent: Number(discountPercent) || 0,
        discountAmount,
        totalAmount,
        paymentMethod,
        additionalNotes,
        nextdate,
        billDate: new Date().toLocaleDateString(),
        billTime: new Date().toLocaleTimeString(),
        billNumber: `${TokenNumber}`,
        createdAt: Date.now(),
      };

      const billsRef = ref(db, `assigntokens/${patientId}(${patientName})/bills`);
      const newBillRef = push(billsRef);
      await set(newBillRef, billData);

      toast.success("Bill generated and saved successfully!", {
        position: "top-right",
        autoClose: 2500,
      });
    } catch (err) {
      console.error("Failed to create bill:", err);
      toast.error("Failed to generate bill.");
    } finally {
      setSaving(false);
    }
  } else {
    toast.error("Patient has no token");
    setSaving(false);
  }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
          <p className="mt-2 text-sm text-gray-500">
            Generate detailed bills for patient consultations and prescribed medications
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                    <i className="ri-file-list-2-line text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Bill Details</h2>
                    <p className="text-sm text-gray-500">Fill in patient and billing information</p>
                  </div>
                </div>
              </div>

              <form className="p-6" onSubmit={handleSubmit}>
                {/* Patient Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="patientname" className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="patientname"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter patient name"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="patientid" className="block text-sm font-medium text-gray-700 mb-1">
                        Patient ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="patientid"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter patient ID"
                        required
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Consultation */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Consultation
                  </h3>
                  <div className="w-full md:w-1/2">
                    <label htmlFor="consultation" className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Fee <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <i className="ri-money-rupee-circle-line"></i>
                      </span>
                      <input
                        type="number"
                        id="consultation"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter amount"
                        required
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Medicines */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Medicines
                  </h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label htmlFor="medicinename" className="block text-xs font-medium text-gray-500 mb-1">
                          Medicine Name
                        </label>
                        <input
                          type="text"
                          id="medicinename"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Medicine name"
                          value={medicineInput.name}
                          onChange={(e) => handleMedicineInputChange("name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="Quantity" className="block text-xs font-medium text-gray-500 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="Quantity"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Qty"
                          min="1"
                          value={medicineInput.quantity}
                          onChange={(e) => handleMedicineInputChange("quantity", e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="Rate" className="block text-xs font-medium text-gray-500 mb-1">
                          Rate
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500 text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            id="Rate"
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            value={medicineInput.rate}
                            onChange={(e) => handleMedicineInputChange("rate", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addMedicine}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <i className="ri-add-line mr-1"></i> Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Medicine List */}
                  {medicines.length > 0 && (
                    <div className="space-y-3">
                      {medicines.map((med, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                              <i className="ri-medicine-bottle-line"></i>
                            </span>
                            <div>
                              <p className="font-medium text-gray-800">{med.name}</p>
                              <p className="text-xs text-gray-500">{med.quantity} x ₹{med.rate.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">₹{(med.quantity * med.rate).toFixed(2)}</span>
                            <button
                              onClick={() => deleteMedicine(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="Discount(%)" className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        id="Discount(%)"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="payment-method"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Online Transfer">Online Transfer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="additional-notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      id="additional-notes"
                      rows="3"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Any additional notes or remarks"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Follow-up Schedule */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Follow-up Schedule
                  </h3>
                  <div className="w-full md:w-1/2">
                    <label htmlFor="next-checkup-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Next Checkup After
                    </label>
                    <select
                      id="next-checkup-date"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={nextdate}
                      onChange={(e) => setNextDate(e.target.value)}
                    >
                      <option value="No Required">Not Required</option>
                      <option value="3 days">3 Days</option>
                      <option value="1 Week">1 Week</option>
                      <option value="2 Week">2 Weeks</option>
                      <option value="3 Week">3 Weeks</option>
                      <option value="4 Week">4 Weeks</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Generating Bill...
                      </>
                    ) : (
                      <>
                        <i className="ri-file-list-2-line mr-2"></i>
                        Generate Bill
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                    <i className="ri-calculator-line text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Bill Summary</h2>
                    <p className="text-sm text-gray-500">Real-time calculation preview</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation:</span>
                    <span className="font-medium">₹{Number(consultationFee) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medicines:</span>
                    <span className="font-medium">₹{medicinesTotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ({discountPercent}%):</span>
                    <span className="text-red-500">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-gray-800 font-semibold">Total Amount:</span>
                    <span className="text-blue-600 font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Bill Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bill Date:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bill Time:</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bill Number:</span>
                      <span className="font-medium">T00#{TokenNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                    <i className="ri-information-line mr-2"></i> Payment Method
                  </h3>
                  <p className="text-blue-700">
                    {paymentMethod === "Cash" && <><i className="ri-money-dollar-circle-line mr-1"></i> Cash Payment</>}
                    {paymentMethod === "Card" && <><i className="ri-bank-card-line mr-1"></i> Credit/Debit Card</>}
                    {paymentMethod === "UPI" && <><i className="ri-smartphone-line mr-1"></i> UPI Payment</>}
                    {paymentMethod === "Online Transfer" && <><i className="ri-bank-line mr-1"></i> Online Transfer</>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CreateBill;