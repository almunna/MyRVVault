import React, { useState } from "react";
import { Input, Button, Select, Collapse, Spin, message } from "antd";
import axios from "axios";

const { Option } = Select;
const { Panel } = Collapse;

const Recalls = () => {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [recalls, setRecalls] = useState([]);

  const handleSearch = async () => {
    if (!make || !model || !year) {
      return message.warning("Please fill all fields");
    }

    setLoading(true);
    setRecalls([]);
    try {
      const response = await axios.get(
        `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${make}&model=${model}&modelYear=${year}`
      );
      setRecalls(response.data.results || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch recall data");
    }
    setLoading(false);
  };

  return (
    <div className="container m-auto ">
      {/* Search Section */}
      <h1 className="text-3xl font-semibold text-[#F9B038] mb-6">Recalls</h1>
      <div className="max-w-4xl mx-auto p-6 bg-[#F9B038] rounded shadow">
        <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Input
          placeholder="Make (e.g. Acura)"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
        <Input
          placeholder="Model (e.g. RDX)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <Input
          placeholder="Model Year (e.g. 2012)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <Button type="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-6">
          <Spin tip="Fetching Recalls..." size="large" />
        </div>
      )}

      {/* Results Section */}
      {!loading && recalls.length > 0 && (
        <Collapse accordion>
          {recalls.map((item, index) => (
            <Panel
              key={index}
              header={`${item.Make} ${item.Model} (${item.ModelYear}) - ${item.Component}`}
            >
              <p>
                <strong>Manufacturer:</strong> {item.Manufacturer}
              </p>
              <p>
                <strong>Campaign Number:</strong> {item.NHTSACampaignNumber}
              </p>
              <p>
                <strong>Action Number:</strong> {item.NHTSAActionNumber}
              </p>
              <p>
                <strong>Report Date:</strong> {item.ReportReceivedDate}
              </p>
              <p>
                <strong>Summary:</strong> {item.Summary}
              </p>
              <p>
                <strong>Consequence:</strong> {item.Consequence}
              </p>
              <p>
                <strong>Remedy:</strong> {item.Remedy}
              </p>
              <p>
                <strong>Notes:</strong> {item.Notes}
              </p>
              <p>
                <strong>Model Year:</strong> {item.ModelYear}
              </p>
              <p>
                <strong>Make:</strong> {item.Make}
              </p>
              <p>
                <strong>Model:</strong> {item.Model}
              </p>
            </Panel>
          ))}
        </Collapse>
      )}

      {!loading && recalls.length === 0 && (
        <div className="text-center py-6 text-gray-500">No recalls found.</div>
      )}
      </div>
    </div>
  );
};

export default Recalls;
