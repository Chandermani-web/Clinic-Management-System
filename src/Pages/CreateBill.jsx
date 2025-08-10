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

  // Patient info
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");

  // Consultation fee
  const [consultationFee, setConsultationFee] = useState("");

  // Medicine input & list
  const [medicineInput, setMedicineInput] = useState({
    name: "",
    quantity: 1,
    rate: "",
  });
  const [medicines, setMedicines] = useState([]);

  // Payment details
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Next Date
  const [nextdate, setNextDate] = useState("")
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

      // Save to Firebase under bills/{patientId}/{autoId}
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
  }else{
    toast.error("Patient have not any token");
    setSaving(false);
  }
  };

  return (
    <div className="flex justify-center">
      <div className="flex flex-col py-10 xl:w-[80%] gap-6">
        <h1 className="text-2xl font-bold ">Create Bill</h1>
        <p className="text-gray-400 text-xs">
          Generate bills for patient consultations and medicines
        </p>

        <div className="flex flex-row gap-6 mt-2">
          {/* Left Panel */}
          <div className="border border-gray-200 bg-white w-2/3 rounded-xl p-5 shadow-sm">
            <div>
              <h1 className="text-2xl font-semibold">
                <i className="ri-money-dollar-box-line font-light text-blue-500 "></i>
                Bill Details
              </h1>
              <p className="text-zinc-600 text-xs">
                Generate bills for patient consultations and medicines
              </p>
            </div>

            <form
              className="grid grid-cols-1 gap-4 mt-5"
              onSubmit={handleSubmit}
            >
              {/* Patient Information */}
              <h1 className="font-semibold">Patient Information</h1>
              <div className="flex gap-5 xs:flex-col">
                <div className=" flex-1 flex flex-col gap-1">
                  <label
                    htmlFor="patientname"
                    className="text-xs p-1 font-semibold"
                  >
                    Patient Name*
                  </label>
                  <input
                    type="text"
                    id="patientname"
                    placeholder="Enter Patient Name"
                    className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label
                    htmlFor="patientid"
                    className="text-xs p-1 font-semibold"
                  >
                    Patient ID*
                  </label>
                  <input
                    type="text"
                    id="patientid"
                    placeholder="Enter Patient Id"
                    className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
              </div>

              <hr className="text-gray-300" />

              {/* Consultation Fee */}
              <h1 className="font-semibold">Consultation</h1>
              <div className="flex-1 flex flex-col gap-1">
                <label
                  htmlFor="consultation"
                  className="text-xs p-1 font-semibold"
                >
                  Consultation Fee{" "}
                  <i className="ri-money-rupee-circle-line text-sm font-extralight"></i>
                  *
                </label>
                <input
                  type="number"
                  id="consultation"
                  placeholder="Enter consultation fee"
                  className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                  required
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                />
              </div>

              <hr className="text-gray-300" />

              {/* Medicines */}
              <h1 className="font-semibold">Medicines</h1>
              <div className=" flex-1 grid grid-cols-4 p-3 gap-5 items-end bg-gray-50 rounded-xl border border-gray-200">
                <div className=" flex-1 flex flex-col gap-1">
                  <label
                    htmlFor="medicinename"
                    className="text-xs p-1 font-semibold"
                  >
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    id="medicinename"
                    placeholder="Medicine Name"
                    className="bg-white py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                    value={medicineInput.name}
                    onChange={(e) =>
                      handleMedicineInputChange("name", e.target.value)
                    }
                  />
                </div>
                <div className=" flex-1 flex flex-col gap-1">
                  <label
                    htmlFor="Quantity"
                    className="text-xs p-1 font-semibold"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="Quantity"
                    placeholder="Quantity"
                    className="bg-white py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                    value={medicineInput.quantity}
                    onChange={(e) =>
                      handleMedicineInputChange("quantity", e.target.value)
                    }
                  />
                </div>
                <div className=" flex-1 flex flex-col gap-1">
                  <label htmlFor="Rate" className="text-xs p-1 font-semibold">
                    Rate{" "}
                    <i className="ri-money-rupee-circle-line text-sm font-extralight"></i>
                  </label>
                  <input
                    type="number"
                    id="Rate"
                    min={1}
                    placeholder="Rate"
                    className="bg-white py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                    value={medicineInput.rate}
                    onChange={(e) =>
                      handleMedicineInputChange("rate", e.target.value)
                    }
                  />
                </div>
                <div className="flex-1">
                  <button
                    onClick={addMedicine}
                    className="ri-add-line bg-blue-600 w-full flex justify-center py-2 rounded-lg text-white hover:bg-blue-700 transition"
                  >
                    {" "}
                    Add
                  </button>
                </div>
              </div>

              {/* added medicine list */}
              {medicines.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {medicines.map((med, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div className="flex-1 flex gap-4 justify-between items-center">
                        <span className="text-sm font-medium">{med.name}</span>
                        <span className="text-sm">Qty: {med.quantity}</span>
                        <span className="text-sm">₹{med.rate}</span>
                        <span className="text-sm">
                          Line: ₹{med.quantity * med.rate}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteMedicine(index)}
                        className="text-white hover:bg-red-600 px-3 py-1 ml-10 bg-red-500 rounded-lg"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <hr className="text-gray-300" />

              {/* Payment Details */}
              <h1 className="font-semibold">Payment Details</h1>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex-1 flex justify-between gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <label
                      htmlFor="Discount(%)"
                      className="text-xs p-1 font-semibold"
                    >
                      Discount(%)
                    </label>
                    <input
                      type="number"
                      id="Discount(%)"
                      placeholder="0"
                      className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                      required
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label
                      htmlFor="payment-method"
                      className="text-xs p-1 font-semibold"
                    >
                      Payment Method *
                    </label>
                    <select
                      name="payment-method"
                      id="payment-method"
                      className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border text-sm border-gray-200 focus:border-blue-500"
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
                <div className="flex flex-col gap-2 grid-cols-2">
                  <label
                    htmlFor="additional-notes"
                    className="text-xs p-1 font-semibold"
                  >
                    Additional Notes
                  </label>
                  <textarea
                    name="additional-notes"
                    id="additional-notes"
                    cols={60}
                    rows={4}
                    placeholder="Any additional notes or remarks"
                    className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <hr className="text-gray-300"/>

              <h1 className="font-semibold"><i className="ri-calendar-2-line"></i> Follow-up Schedule</h1>
              <div className="flex-1 flex flex-col gap-3">
                <label
                  htmlFor="next-checkup-date"
                  className="text-xs p-1 font-semibold"
                >
                  Next Checkup After (Days)
                </label>
                <select name="next-checkup-date" id="next-checkup-date" className="bg-gray-50 py-2 px-3 rounded-lg placeholder:text-zinc-500 outline-0 placeholder:text-[12px] border border-gray-200 focus:border-blue-500" value={nextdate} onChange={(e)=>setNextDate(e.target.value)}>
                  <option value="No Required">No Required</option>
                  <option value="3 days">3 Days</option>
                  <option value="1 Week">1 Week</option>
                  <option value="2 Week">2 Week</option>
                  <option value="3 Week">3 Week</option>
                  <option value="4 Week">4 Week</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 py-2 px-3 rounded-lg text-white text-sm hover:bg-blue-700 transition"
              >
                <i className="ri-money-dollar-box-line font-light "></i>{" "}
                {saving ? "Generating..." : "Generate Bill"}
              </button>
            </form>
          </div>

          {/* Right Panel */}
          <div className="xl:w-[30%] p-5 flex flex-col border rounded-2xl border-gray-200 bg-white shadow-sm h-max">
            {/* Top panel */}
            <div>
              <h1 className="text-xl font-semibold">
                <i className="ri-calculator-line text-blue-600"></i> Bill Summary
              </h1>
              <p className="text-gray-400 text-xs">Real-time calculation</p>
              <div className="flex flex-col mt-5">
                <div className="flex justify-between">
                  <p className="text-gray-500 text-xs">Consultation Fee:</p>
                  <p className="text-gray-500">
                    {Number(consultationFee) || 0}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500 text-xs">Medicines Total:</p>
                  <p className="text-gray-500">{medicinesTotal}</p>
                </div>
                <hr className="text-gray-400" />
                <div className="flex justify-between">
                  <p className="text-gray-500 text-xs">Subtotal:</p>
                  <p className="text-gray-500">{subtotal}</p>
                </div>
                <hr className="text-gray-400" />
                <div className="flex justify-between">
                  <h1 className="font-semibold">Total Amount</h1>
                  <h1 className="font-semibold text-blue-600">₹{totalAmount.toFixed(2)}</h1>
                </div>
              </div>
            </div>

            {/* bottom panel */}
            <div className="bg-gray-50 rounded-xl p-3 mt-4 border border-gray-200">
              <h2 className="mb-2 font-semibold">Bill Information</h2>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Bill Date:</p>
                <p className="text-sm">
                  {new Date(Date.now()).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Bill Time:</p>
                <p className="text-sm">
                  {new Date(Date.now()).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">Bill Number:</p>
                <p className="text-sm">T00#{TokenNumber}</p>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default CreateBill;
