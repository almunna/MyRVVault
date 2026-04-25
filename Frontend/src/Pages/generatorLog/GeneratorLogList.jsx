import { useState } from "react";
import { Link } from "react-router-dom";
import { message, Spin, Empty, Progress, Modal } from "antd";
import {
  useGetGeneratorLogsQuery,
  useDeleteGeneratorLogMutation,
  useAddMaintanceMutation,
} from "../redux/api/routesApi";
import { FaPlus, FaTrash, FaEdit, FaCog, FaWrench } from "react-icons/fa";

const GeneratorLogList = () => {
  const { data, isLoading, refetch } = useGetGeneratorLogsQuery();
  const [deleteGeneratorLog] = useDeleteGeneratorLogMutation();
  const [addMaintenance, { isLoading: logginMaintenance }] = useAddMaintanceMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [loggingTask, setLoggingTask] = useState(null); // task name being logged

  const logs = data?.data || [];
  const totalHours = data?.totalHours || 0;
  const reminders = data?.reminders || [];
  const dueReminders = reminders.filter((r) => r.isDue);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this generator log entry?")) return;
    setDeletingId(id);
    try {
      const res = await deleteGeneratorLog(id).unwrap();
      message.success(res?.message || "Deleted successfully");
      refetch();
    } catch (err) {
      message.error(err?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogMaintenance = async (reminder) => {
    Modal.confirm({
      title: `Log "${reminder.task}" as Maintenance?`,
      content: `This will create a maintenance record for Generator — ${reminder.task} at ${totalHours} hours.`,
      okText: "Log It",
      okButtonProps: { className: "bg-[#3B7D3C] border-[#3B7D3C]" },
      onOk: async () => {
        setLoggingTask(reminder.task);
        try {
          const formData = new FormData();
          formData.append("component", "Generator");
          formData.append("maintenanceToBePerformed", reminder.task);
          formData.append("hoursAtMaintenance", String(totalHours));
          formData.append("date", new Date().toISOString().split("T")[0]);
          formData.append("notes", `Generator ${reminder.task} — logged from Generator Hours tracker at ${totalHours} hrs`);
          await addMaintenance(formData).unwrap();
          message.success(`${reminder.task} added to your Maintenance log`);
        } catch (err) {
          message.error(err?.data?.message || "Failed to log maintenance");
        } finally {
          setLoggingTask(null);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-site mx-auto px-4 lg:px-6 2xl:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#D4872D] rounded-full" />
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                <FaCog className="inline mr-2 text-[#D4872D]" />
                Generator Hours
              </h1>
            </div>
            <p className="text-[#5A5A5A] text-sm ml-4 pl-3">Track hours and stay on top of service intervals</p>
          </div>
          <Link to="/addGeneratorLog">
            <button className="flex items-center gap-2 bg-[#3B7D3C] text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-[#2d6130] transition-colors shadow-sm">
              <FaPlus /> Log Hours
            </button>
          </Link>
        </div>

        {/* Total Hours */}
        <div className="bg-[#1A1A1A] border border-[#D4872D] rounded-2xl p-8 mb-8 text-center">
          <p className="text-[#D4872D] text-sm font-medium mb-1 uppercase tracking-widest">Total Generator Hours</p>
          <p className="text-white text-6xl font-bold">
            {totalHours}
            <span className="text-xl font-normal text-gray-400 ml-2">hrs</span>
          </p>
        </div>

        {/* Due alerts */}
        {dueReminders.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 font-semibold text-sm mb-2">⚠ Service Due</p>
            <ul className="space-y-1">
              {dueReminders.map((r, i) => (
                <li key={i} className="text-amber-800 text-sm">
                  • <strong>{r.task}</strong> — {r.hoursUntilDue <= 0 ? "overdue" : `${r.hoursUntilDue} hrs remaining`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Service Intervals */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Service Intervals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {reminders.map((r, i) => {
              const percent = Math.max(0, Math.min(100, ((r.interval - r.hoursUntilDue) / r.interval) * 100));
              return (
                <div
                  key={i}
                  className={`bg-white border rounded-2xl p-5 shadow-sm ${r.isDue ? "border-red-300" : "border-[#E8F0E8]"}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{r.task}</p>
                      <p className="text-xs text-[#5A5A5A]">Every {r.interval} hrs</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      r.isDue
                        ? "bg-red-100 text-red-700"
                        : "bg-[#E8F0E8] text-[#3B7D3C]"
                    }`}>
                      {r.isDue ? "Due!" : `${r.hoursUntilDue} hrs left`}
                    </span>
                  </div>
                  <Progress
                    percent={Math.round(percent)}
                    strokeColor={r.isDue ? "#ff4d4f" : "#3B7D3C"}
                    trailColor="#E8F0E8"
                    showInfo={false}
                    size="small"
                  />
                  <button
                    onClick={() => handleLogMaintenance(r)}
                    disabled={loggingTask === r.task}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#3B7D3C] text-[#3B7D3C] hover:bg-[#3B7D3C] hover:text-white transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    {loggingTask === r.task ? <Spin size="small" /> : <FaWrench />}
                    Log as Maintenance
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log Entries */}
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Hour Log History</h2>
          {logs.length === 0 ? (
            <Empty
              description={
                <span className="text-[#5A5A5A]">
                  No generator logs yet.{" "}
                  <Link to="/addGeneratorLog" className="text-[#3B7D3C] underline">
                    Log your first entry
                  </Link>
                </span>
              }
            />
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-[#E8F0E8] rounded-2xl px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div>
                    <span className="text-[#1A1A1A] font-bold text-lg">{log.hours} hrs</span>
                    {log.date && (
                      <span className="text-[#5A5A5A] text-sm ml-3">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    )}
                    {log.notes && (
                      <p className="text-[#5A5A5A] text-sm mt-0.5">{log.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/updateGeneratorLog/${log.id}`}>
                      <button className="text-[#3B7D3C] p-2 border border-[#E8F0E8] rounded-lg hover:border-[#3B7D3C] hover:bg-[#E8F0E8] transition-all">
                        <FaEdit />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(log.id)}
                      disabled={deletingId === log.id}
                      className="text-red-400 p-2 border border-red-100 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {deletingId === log.id ? <Spin size="small" /> : <FaTrash />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GeneratorLogList;
