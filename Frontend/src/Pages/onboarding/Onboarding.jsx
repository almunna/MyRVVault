import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Select, message } from "antd";
import { FiCheck, FiArrowRight, FiArrowLeft, FiSkipForward } from "react-icons/fi";

const { Option } = Select;

const TIRE_LAYOUTS = [
  "Single rear", "Dual rear", "Single all", "6-wheel", "8-wheel", "10-wheel", "12-wheel"
];

const STEPS = [
  { id: "welcome", title: "Welcome to My RV Vault", subtitle: "Your complete RV companion" },
  { id: "rv", title: "Add Your RV", subtitle: "Tell us about your rig" },
  { id: "vin", title: "VIN Entry", subtitle: "Optional — auto-populates details" },
  { id: "tires", title: "Tire Configuration", subtitle: "Select your tire layout" },
  { id: "generator", title: "Generator Hours", subtitle: "Track your generator runtime" },
  { id: "maintenance", title: "First Maintenance Item", subtitle: "Optional — you can add more later" },
  { id: "vendor", title: "Add a Vendor", subtitle: "Optional — add a service provider" },
  { id: "complete", title: "You're All Set!", subtitle: "Start exploring My RV Vault" },
];

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rvForm] = Form.useForm();
  const [maintenanceForm] = Form.useForm();
  const [vendorForm] = Form.useForm();
  const [createdRvId, setCreatedRvId] = useState(null);
  const [vinInput, setVinInput] = useState("");
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinInfo, setVinInfo] = useState(null);

  const token = localStorage.getItem("accessToken");

  const progress = Math.round((step / (STEPS.length - 1)) * 100);
  const currentStep = STEPS[step];

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const decodeVin = async () => {
    if (vinInput.length !== 17) { message.warning("VIN must be 17 characters"); return; }
    setVinDecoding(true);
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vinInput.trim()}?format=json`
      );
      const data = await res.json();
      const r = data?.Results?.[0];
      if (r && r.Make) {
        setVinInfo({ make: r.Make, model: r.Model, year: r.ModelYear, bodyClass: r.BodyClass, vehicleType: r.VehicleType });
        message.success("VIN decoded successfully!");
      } else {
        message.error("Could not decode VIN. Please check and try again.");
      }
    } catch {
      message.error("Failed to connect to VIN lookup service.");
    } finally {
      setVinDecoding(false);
    }
  };

  const handleVinContinue = async () => {
    if (vinInput && createdRvId) {
      try {
        await fetch(`${BASE_URL}/rv/update-rv/${createdRvId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ vin: vinInput, ...(vinInfo ? { brand: vinInfo.make, model: vinInfo.model } : {}) }),
        });
      } catch {}
    }
    next();
  };

  const submitRv = async (values) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/rv/add-rv`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedRvId(data.data?.id || data.data?._id);
        // Also select this RV
        if (data.data?.id || data.data?._id) {
          await fetch(`${BASE_URL}/user/select-rv`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ rvId: data.data.id || data.data._id }),
          });
        }
        message.success("RV added!");
        next();
      } else {
        message.error(data.message || "Failed to add RV");
      }
    } catch {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submitMaintenance = async (values) => {
    if (!values.itemName) { next(); return; }
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/maintenance-schedule/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          itemName: values.itemName,
          intervalMiles: values.intervalMiles || null,
          notes: values.notes || null,
        }),
      });
      message.success("Maintenance item added!");
      next();
    } catch {
      message.error("Failed to add maintenance item");
    } finally {
      setLoading(false);
    }
  };

  const submitVendor = async (values) => {
    if (!values.name) { next(); return; }
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: values.name, category: values.category || "general_service" }),
      });
      message.success("Vendor added!");
      next();
    } catch {
      message.error("Failed to add vendor");
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    // Mark onboarding complete in user profile
    try {
      await fetch(`${BASE_URL}/user/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ onboardingCompleted: true }),
      });
    } catch {}
    navigate("/profilePage");
  };

  const inputClass = "w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2 placeholder-yellow-600";

  const renderStepContent = () => {
    switch (currentStep.id) {
      case "welcome":
        return (
          <div className="text-center py-8">
            <div className="text-8xl mb-6">🚐</div>
            <h2 className="text-xl text-gray-300 mb-4">
              Manage your RV, track trips, schedule maintenance, find vendors — all in one place.
            </h2>
            <p className="text-gray-500">Let's set up your account in under 3 minutes.</p>
            <div className="grid grid-cols-2 gap-4 mt-8 text-left">
              {[
                { icon: "🗺️", text: "Track your travels across all 50 states" },
                { icon: "🔧", text: "Never miss a maintenance item" },
                { icon: "📋", text: "Manage checklists & packing lists" },
                { icon: "📍", text: "Find RV service providers near you" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "rv":
        return (
          <Form form={rvForm} layout="vertical" onFinish={submitRv}>
            <Form.Item
              label={<span className="text-[#F9B038]">RV Name / Nickname *</span>}
              name="name"
              rules={[{ required: true, message: "Please enter a name for your RV" }]}
            >
              <Input className={inputClass} placeholder="e.g., Our Home on Wheels" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label={<span className="text-[#F9B038]">Brand / Make</span>} name="brand">
                <Input className={inputClass} placeholder="e.g., Thor, Jayco" />
              </Form.Item>
              <Form.Item label={<span className="text-[#F9B038]">Model</span>} name="model">
                <Input className={inputClass} placeholder="e.g., Magnitude, Eagle" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label={<span className="text-[#F9B038]">Year</span>} name="year">
                <Input className={inputClass} placeholder="e.g., 2022" type="number" />
              </Form.Item>
              <Form.Item label={<span className="text-[#F9B038]">License Plate</span>} name="licensePlate">
                <Input className={inputClass} placeholder="e.g., ABC-1234" />
              </Form.Item>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#F9B038] text-black font-semibold py-3 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60 mt-2">
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </Form>
        );

      case "vin":
        return (
          <div>
            <p className="text-gray-400 mb-4">Enter your VIN to auto-populate chassis and manufacturer details. This step is optional.</p>
            <input
              type="text"
              maxLength={17}
              value={vinInput}
              placeholder="17-character VIN (optional)"
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-2 px-3 rounded-md placeholder-yellow-700 uppercase tracking-wider text-center text-lg mb-2 outline-none"
              onChange={e => { setVinInput(e.target.value.toUpperCase()); setVinInfo(null); }}
            />
            <p className="text-gray-500 text-sm text-center mb-4">Found on driver's door jamb or dashboard</p>
            <button
              type="button"
              onClick={decodeVin}
              disabled={vinDecoding || vinInput.length !== 17}
              className="w-full border border-[#F9B038] text-[#F9B038] py-2 rounded-md font-medium disabled:opacity-40 hover:bg-yellow-900/20 transition-colors"
            >
              {vinDecoding ? "Decoding..." : "Decode VIN"}
            </button>
            {vinInfo && (
              <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-green-600 space-y-1 text-sm">
                <p className="text-green-400 font-semibold mb-2">VIN Decoded</p>
                {vinInfo.year && <p className="text-gray-300"><span className="text-gray-500">Year:</span> {vinInfo.year}</p>}
                {vinInfo.make && <p className="text-gray-300"><span className="text-gray-500">Make:</span> {vinInfo.make}</p>}
                {vinInfo.model && <p className="text-gray-300"><span className="text-gray-500">Model:</span> {vinInfo.model}</p>}
                {vinInfo.bodyClass && <p className="text-gray-300"><span className="text-gray-500">Body:</span> {vinInfo.bodyClass}</p>}
              </div>
            )}
          </div>
        );

      case "tires":
        return (
          <div>
            <p className="text-gray-400 mb-6">Select your RV's tire configuration.</p>
            <div className="grid grid-cols-2 gap-3">
              {TIRE_LAYOUTS.map(layout => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => next()}
                  className="border border-gray-600 rounded-lg p-4 text-gray-300 hover:border-[#F9B038] hover:text-[#F9B038] hover:bg-yellow-900/10 transition-colors text-left"
                >
                  <span className="text-lg">🛞</span>
                  <p className="mt-1 font-medium">{layout}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case "generator":
        return (
          <div>
            <p className="text-gray-400 mb-6">Track your generator's total runtime hours for maintenance scheduling.</p>
            <label className="text-[#F9B038] text-sm font-medium block mb-2">Current Generator Hours</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              className="w-full bg-transparent border border-[#F9B038] text-[#F9B038] py-3 px-4 rounded-md text-2xl text-center outline-none mb-2"
            />
            <p className="text-gray-500 text-sm text-center">Check your generator's hour meter display</p>
          </div>
        );

      case "maintenance":
        return (
          <Form form={maintenanceForm} layout="vertical" onFinish={submitMaintenance}>
            <p className="text-gray-400 mb-4">Add your first maintenance item to start tracking service schedules. Skip if you prefer to set these up later.</p>
            <Form.Item label={<span className="text-[#F9B038]">Maintenance Item</span>} name="itemName">
              <Input className={inputClass} placeholder="e.g., Oil Change, Tire Rotation" />
            </Form.Item>
            <Form.Item label={<span className="text-[#F9B038]">Interval (Miles)</span>} name="intervalMiles">
              <Input className={inputClass} placeholder="e.g., 5000" type="number" />
            </Form.Item>
            <Form.Item label={<span className="text-[#F9B038]">Notes</span>} name="notes">
              <Input className={inputClass} placeholder="Any notes..." />
            </Form.Item>
            <button type="submit" disabled={loading}
              className="w-full bg-[#F9B038] text-black font-semibold py-3 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60">
              {loading ? "Saving..." : "Add & Continue"}
            </button>
          </Form>
        );

      case "vendor":
        return (
          <Form form={vendorForm} layout="vertical" onFinish={submitVendor}>
            <p className="text-gray-400 mb-4">Add a service provider, dealer, or repair shop you trust. Skip to set these up later.</p>
            <Form.Item label={<span className="text-[#F9B038]">Vendor Name</span>} name="name">
              <Input className={inputClass} placeholder="e.g., Smith's RV Repair" />
            </Form.Item>
            <Form.Item label={<span className="text-[#F9B038]">Category</span>} name="category">
              <Select placeholder="Select category" className="custom-select" style={{ height: 42 }}>
                <Option value="rv_repair">RV Repair</Option>
                <Option value="rv_dealer">RV Dealer</Option>
                <Option value="mobile_rv_tech">Mobile RV Tech</Option>
                <Option value="tire_shop">Tire Shop</Option>
                <Option value="general_service">General Service</Option>
              </Select>
            </Form.Item>
            <button type="submit" disabled={loading}
              className="w-full bg-[#F9B038] text-black font-semibold py-3 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-60">
              {loading ? "Saving..." : "Add & Continue"}
            </button>
          </Form>
        );

      case "complete":
        return (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#F9B038] mb-3">You're All Set!</h2>
            <p className="text-gray-300 mb-6">Your RV Vault is ready. Start exploring all the features.</p>
            <div className="grid grid-cols-2 gap-3 text-sm mb-8">
              {[
                { path: "/campgroundReview", label: "🗺️ Log a Trip" },
                { path: "/newMaintenance", label: "🔧 Maintenance" },
                { path: "/checklist", label: "✅ Checklists" },
                { path: "/vendors", label: "📍 Vendors" },
                { path: "/packingLists", label: "🎒 Packing Lists" },
                { path: "/documents", label: "📄 Document Vault" },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="border border-gray-600 rounded-lg p-3 text-gray-300 hover:border-[#F9B038] hover:text-[#F9B038] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              className="bg-[#F9B038] text-black font-semibold px-10 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const canSkip = ["vin", "tires", "generator", "maintenance", "vendor"].includes(currentStep.id);
  const hasFormSubmit = ["rv", "maintenance", "vendor"].includes(currentStep.id);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F9B038]">My RV Vault</h1>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-[#F9B038] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? "bg-[#F9B038]" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#F9B038] mb-1">{currentStep.title}</h2>
            <p className="text-gray-400">{currentStep.subtitle}</p>
          </div>

          {renderStepContent()}

          {/* Navigation (for non-form steps) */}
          {!hasFormSubmit && currentStep.id !== "complete" && (
            <div className="flex justify-between mt-6">
              {step > 0 ? (
                <button onClick={back} className="flex items-center gap-2 text-gray-400 hover:text-[#F9B038] transition-colors">
                  <FiArrowLeft size={14} /> Back
                </button>
              ) : <div />}

              <div className="flex gap-3">
                {canSkip && (
                  <button onClick={next} className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                    <FiSkipForward size={14} /> Skip
                  </button>
                )}
                {!["welcome", "tires"].includes(currentStep.id) && (
                  <button
                    onClick={currentStep.id === "vin" ? handleVinContinue : next}
                    className="flex items-center gap-2 bg-[#F9B038] text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                  >
                    Continue <FiArrowRight size={14} />
                  </button>
                )}
                {currentStep.id === "welcome" && (
                  <button
                    onClick={next}
                    className="flex items-center gap-2 bg-[#F9B038] text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors text-lg"
                  >
                    Get Started <FiArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Back button for form steps */}
          {hasFormSubmit && step > 1 && (
            <button onClick={back} className="flex items-center gap-2 text-gray-400 hover:text-[#F9B038] transition-colors mt-4">
              <FiArrowLeft size={14} /> Back
            </button>
          )}

          {hasFormSubmit && canSkip && (
            <div className="text-center mt-3">
              <button onClick={next} className="text-gray-500 hover:text-gray-300 text-sm">
                Skip this step →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
