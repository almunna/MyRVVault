import { Form, Input, DatePicker, Select, Spin, message } from "antd";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DashboardOutlined, FileTextOutlined, LinkOutlined, InfoCircleOutlined, ShopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useLoadScript } from "@react-google-maps/api";
import {
  useGetSingleFuelLogQuery,
  useUpdateFuelLogMutation,
  useGetCampQuery,
} from "../redux/api/routesApi";

const GOOGLE_MAPS_LIBRARIES = ["places"];

const dateFormat = "MM/DD/YYYY";
const parseNum  = (v) => (v ? v.toString().replace(/,/g, "") : "");
const formatNum = (v) => {
  if (!v) return "";
  return v.toString().replace(/[^\d.]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const fieldLabel = (text) => <span className="text-sm font-medium text-[#5A5A5A]">{text}</span>;
const inputClass = "w-full rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-[#1A1A1A] placeholder-gray-400 focus:border-[#3B7D3C] focus:ring-1 focus:ring-[#3B7D3C] transition-all duration-200";

const Card = ({ icon, title, children }) => (
  <div className="bg-white border border-[#E8F0E8] rounded-2xl p-6 mb-5 shadow-sm">
    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#E8F0E8]">
      <div className="w-8 h-8 rounded-lg bg-[#E8F0E8] flex items-center justify-center">
        <span className="text-[#3B7D3C] text-sm">{icon}</span>
      </div>
      <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
    </div>
    {children}
  </div>
);

const UpdateFuel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewCost, setPreviewCost] = useState(null);

  const stationNameRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { data, isLoading } = useGetSingleFuelLogQuery({ id });
  const [updateFuelLog]     = useUpdateFuelLogMutation();
  const { data: tripsData } = useGetCampQuery();
  const trips = useMemo(() => tripsData?.data || [], [tripsData]);

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!mapsLoaded || !stationNameRef.current) return;
    const inputEl = stationNameRef.current.input;
    if (!inputEl) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputEl, {
      types: ["establishment"],
      fields: ["name", "address_components", "formatted_phone_number", "website"],
    });
    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place) return;

      let streetNumber = "", route = "", city = "", state = "", zip = "";
      (place.address_components || []).forEach((comp) => {
        if (comp.types.includes("street_number"))               streetNumber = comp.long_name;
        if (comp.types.includes("route"))                       route = comp.long_name;
        if (comp.types.includes("locality"))                    city = comp.long_name;
        if (comp.types.includes("administrative_area_level_1")) state = comp.short_name;
        if (comp.types.includes("postal_code"))                 zip = comp.long_name;
      });

      form.setFieldsValue({
        stationName:    place.name || form.getFieldValue("stationName"),
        stationAddress: [streetNumber, route].filter(Boolean).join(" ") || undefined,
        stationCity:    city || undefined,
        stationState:   state || undefined,
        stationZip:     zip || undefined,
        stationPhone:   place.formatted_phone_number?.replace(/\D/g, "") || undefined,
        stationWebsite: place.website || undefined,
      });
    });
  }, [mapsLoaded]);

  useEffect(() => {
    if (data?.data) {
      const log = data.data;
      form.setFieldsValue({
        odometer:       log.odometer?.toString(),
        gallons:        log.gallons?.toString(),
        pricePerGallon: log.pricePerGallon?.toString() || "",
        tripId:         log.tripId || undefined,
        notes:          log.notes || "",
        date:           log.date ? dayjs(log.date) : null,
        stationName:    log.stationName || undefined,
        stationAddress: log.stationAddress || undefined,
        stationCity:    log.stationCity || undefined,
        stationState:   log.stationState || undefined,
        stationZip:     log.stationZip || undefined,
        stationPhone:   log.stationPhone || undefined,
        stationWebsite: log.stationWebsite || undefined,
      });
      if (log.pricePerGallon && log.gallons) {
        setPreviewCost((log.pricePerGallon * log.gallons).toFixed(2));
      }
    }
  }, [data, form]);

  const handleValuesChange = (_, all) => {
    const g = parseFloat(parseNum(all.gallons)) || 0;
    const p = parseFloat(parseNum(all.pricePerGallon)) || 0;
    setPreviewCost(g > 0 && p > 0 ? (g * p).toFixed(2) : null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        odometer:       parseNum(values.odometer),
        gallons:        parseNum(values.gallons),
        pricePerGallon: values.pricePerGallon ? parseNum(values.pricePerGallon) : undefined,
        tripId:         values.tripId || null,
        notes:          values.notes || "",
        date:           values.date ? dayjs(values.date).toISOString() : undefined,
        stationName:    values.stationName || null,
        stationAddress: values.stationAddress || null,
        stationCity:    values.stationCity || null,
        stationState:   values.stationState || null,
        stationZip:     values.stationZip || null,
        stationPhone:   values.stationPhone || null,
        stationWebsite: values.stationWebsite || null,
      };
      const res = await updateFuelLog({ id, data: payload }).unwrap();
      message.success(res?.message || "Updated successfully");
      navigate("/fuelList");
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Edit Fill-Up</h1>
          </div>
          <p className="text-[#5A5A5A] text-sm ml-4 pl-3">
            Editing odometer or gallons will recalculate MPG and cost automatically.
          </p>
        </div>

        <div className="max-w-2xl">
          <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={handleValuesChange}>

            {/* Fill-up details */}
            <Card icon={<DashboardOutlined />} title="Fill-Up Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Form.Item label={fieldLabel("Date")} name="date" className="mb-0">
                  <DatePicker
                    size="large" format={dateFormat}
                    className="w-full rounded-lg border-[#E0E0E0]" placeholder="MM/DD/YYYY"
                  />
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Odometer (mi)")} name="odometer" className="mb-0"
                  normalize={parseNum} getValueProps={(v) => ({ value: formatNum(v) })}
                  rules={[{ required: true, message: "Odometer reading is required" }]}
                >
                  <Input size="large" className={inputClass} placeholder="e.g. 45,000"
                    suffix={<span className="text-gray-400 text-xs">mi</span>} />
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Gallons Added")} name="gallons" className="mb-0"
                  normalize={parseNum} getValueProps={(v) => ({ value: formatNum(v) })}
                  rules={[
                    { required: true, message: "Gallons is required" },
                    {
                      validator: (_, val) => {
                        const n = parseFloat(parseNum(val));
                        if (n <= 0) return Promise.reject("Gallons must be greater than 0");
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input size="large" className={inputClass} placeholder="e.g. 40"
                    suffix={<span className="text-gray-400 text-xs">gal</span>} />
                </Form.Item>

                <Form.Item
                  label={fieldLabel("Price Per Gallon (optional)")} name="pricePerGallon" className="mb-0"
                  normalize={parseNum} getValueProps={(v) => ({ value: formatNum(v) })}
                >
                  <Input size="large" className={inputClass} placeholder="e.g. 3.89"
                    prefix={<span className="text-gray-400 text-sm">$</span>} />
                </Form.Item>
              </div>

              {/* Live cost preview */}
              {previewCost && (
                <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  <InfoCircleOutlined className="text-[#D4872D]" />
                  <span className="text-sm text-[#D4872D] font-medium">
                    Estimated total cost: <strong>${previewCost}</strong>
                  </span>
                </div>
              )}
            </Card>

            {/* Gas Station */}
            <Card icon={<ShopOutlined />} title="Gas Station (optional)">
              <p className="text-xs text-[#5A5A5A] mb-4">
                Start typing the station name — address, phone, and website will auto-fill.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={fieldLabel("Station Name")} name="stationName" className="mb-0 md:col-span-2">
                  <Input
                    ref={stationNameRef}
                    size="large" className={inputClass}
                    placeholder={mapsLoaded ? "Type to search (e.g. Pilot, Love's, Shell…)" : "e.g. Pilot Flying J"}
                  />
                </Form.Item>
                <Form.Item label={fieldLabel("Address")} name="stationAddress" className="mb-0 md:col-span-2">
                  <Input size="large" className={inputClass} placeholder="Street address" />
                </Form.Item>
                <Form.Item label={fieldLabel("City")} name="stationCity" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="City" />
                </Form.Item>
                <Form.Item label={fieldLabel("State")} name="stationState" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. AZ" maxLength={2} />
                </Form.Item>
                <Form.Item label={fieldLabel("ZIP Code")} name="stationZip" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. 85001" />
                </Form.Item>
                <Form.Item label={fieldLabel("Phone")} name="stationPhone" className="mb-0">
                  <Input size="large" className={inputClass} placeholder="e.g. 5555551234" />
                </Form.Item>
                <Form.Item label={fieldLabel("Website")} name="stationWebsite" className="mb-0 md:col-span-2">
                  <Input size="large" className={inputClass} placeholder="e.g. https://pilotflyingj.com" />
                </Form.Item>
              </div>
            </Card>

            {/* Trip link */}
            <Card icon={<LinkOutlined />} title="Link to Trip (optional)">
              <Form.Item label={fieldLabel("Trip")} name="tripId" className="mb-0">
                <Select
                  size="large" allowClear placeholder="Select a trip to link this fill-up to"
                  className="w-full"
                  notFoundContent={<span className="text-[#5A5A5A] text-sm">No trips found</span>}
                >
                  {trips.map((t) => (
                    <Select.Option key={t.id} value={t.id}>
                      {t.tripName || t.name || `Trip — ${new Date(t.startDate || t.createdAt).toLocaleDateString()}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>

            {/* Notes */}
            <Card icon={<FileTextOutlined />} title="Notes">
              <Form.Item label={fieldLabel("Notes")} name="notes" className="mb-0">
                <Input.TextArea
                  rows={3} placeholder="Station name, location, fuel type…"
                  className="w-full rounded-lg border border-[#E0E0E0] text-[#1A1A1A] focus:border-[#3B7D3C] resize-none"
                />
              </Form.Item>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate("/fuelList")}
                className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-[#5A5A5A] font-medium text-sm hover:border-[#3B7D3C] hover:text-[#3B7D3C] transition-all duration-200">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading ? "bg-[#3B7D3C]/70 text-white cursor-not-allowed"
                  : "bg-[#3B7D3C] text-white hover:bg-[#2d6130] shadow-sm hover:shadow-md"
                }`}>
                {loading ? <><Spin size="small" /><span>Saving…</span></> : "Update Fill-Up"}
              </button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  );
};

export default UpdateFuel;
