    import React, { useState, useEffect } from "react";
    import { useLocation, useNavigate } from "react-router-dom";
    import { getAuth } from "firebase/auth";
    import { getDatabase, ref, set } from "firebase/database";
    import { toast, ToastContainer } from "react-toastify";
    import "react-toastify/dist/ReactToastify.css";
    import { app } from "../Firebase/Firebase.js";

    const auth = getAuth();
    const db = getDatabase(app);

    const defaultDoctorFields = {
    fullName: "",
    specialty: "",
    phone: "",
    licenseNumber: "",
    clinicAddress: "",
    };

    const defaultReceptionistFields = {
    fullName: "",
    phone: "",
    employeeId: "",
    shift: "",
    };

    const SignUpDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role || "doctor"; // expected from previous page
    const user = auth.currentUser;

    const [loading, setLoading] = useState(false);
    const [doctorData, setDoctorData] = useState(defaultDoctorFields);
    const [receptionistData, setReceptionistData] = useState(defaultReceptionistFields);

    useEffect(() => {
        if (!user) {
        toast.error("You must be logged in to complete profile.");
        navigate("/signin");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
        if (role === "doctor") {
            const { fullName, specialty, phone, licenseNumber, clinicAddress } = doctorData;
            if (!fullName || !specialty || !phone || !licenseNumber || !clinicAddress) {
            toast.error("Please fill all doctor fields.");
            setLoading(false);
            return;
            }
            await set(ref(db, `doctors/${doctorData.fullName}(${doctorData.licenseNumber})`), {
            uid: user.uid,
            email: user.email,
            role,
            fullName,
            specialty,
            phone,
            licenseNumber,
            clinicAddress,
            createdAt: Date.now(),
            });
        } else {
            const { fullName, phone, employeeId, shift } = receptionistData;
            if (!fullName || !phone || !employeeId || !shift) {
            toast.error("Please fill all receptionist fields.");
            setLoading(false);
            return;
            }
            await set(ref(db, `receptionists/${receptionistData.fullName}(${receptionistData.employeeId})`), {
            uid: user.uid,
            email: user.email,
            role,
            fullName,
            phone,
            employeeId,
            shift,
            createdAt: Date.now(),
            });
        }

        toast.success("Profile saved!", {
            autoClose: 1000,
            onClose: () => {
            navigate("/Clinic-Management/dashboard");
            },
        });
        } catch (err) {
        console.error("Save failed:", err);
        toast.error("Failed to save details.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-950">
            Complete {role === "doctor" ? "Doctor" : "Receptionist"} Profile
            </h2>
            <p className="text-center mb-6 text-sm text-gray-600">
            Logged in as: <span className="font-medium">{user?.email}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                type="text"
                value={
                    role === "doctor" ? doctorData.fullName : receptionistData.fullName
                }
                onChange={(e) => {
                    const v = e.target.value;
                    if (role === "doctor") setDoctorData((d) => ({ ...d, fullName: v }));
                    else setReceptionistData((r) => ({ ...r, fullName: v }));
                }}
                className="w-full px-3 py-2 border rounded"
                placeholder="Full name"
                required
                />
            </div>

            {role === "doctor" ? (
                <>
                <div>
                    <label className="block text-sm font-medium mb-1">Specialty</label>
                    <input
                    type="text"
                    value={doctorData.specialty}
                    onChange={(e) =>
                        setDoctorData((d) => ({ ...d, specialty: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="e.g., General Physician"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                    type="tel"
                    value={doctorData.phone}
                    onChange={(e) =>
                        setDoctorData((d) => ({ ...d, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Mobile number"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                    License Number
                    </label>
                    <input
                    type="text"
                    value={doctorData.licenseNumber}
                    onChange={(e) =>
                        setDoctorData((d) => ({ ...d, licenseNumber: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Medical license ID"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                    Clinic Address
                    </label>
                    <input
                    type="text"
                    value={doctorData.clinicAddress}
                    onChange={(e) =>
                        setDoctorData((d) => ({ ...d, clinicAddress: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Clinic address"
                    required
                    />
                </div>
                </>
            ) : (
                <>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                    type="tel"
                    value={receptionistData.phone}
                    onChange={(e) =>
                        setReceptionistData((r) => ({ ...r, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Mobile number"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                    Employee ID
                    </label>
                    <input
                    type="text"
                    value={receptionistData.employeeId}
                    onChange={(e) =>
                        setReceptionistData((r) => ({ ...r, employeeId: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Employee ID"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Shift</label>
                    <select
                    value={receptionistData.shift}
                    onChange={(e) =>
                        setReceptionistData((r) => ({ ...r, shift: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                    required
                    >
                    <option value="">Select shift</option>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                    </select>
                </div>
                </>
            )}

            <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
                {loading
                ? "Saving..."
                : `Save ${role === "doctor" ? "Doctor" : "Receptionist"} Profile`}
            </button>
            </form>
            <ToastContainer />
        </div>
        </div>
    );
    };

    export default SignUpDetails;
