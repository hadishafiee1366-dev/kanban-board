import React, { useState, useEffect } from "react";

// --- Constants & Mock Data ---
const LABELS_DATA = [
  { id: "design", text: "Design", colorClasses: "bg-pink-100 text-pink-600 ring-pink-500" },
  { id: "development", text: "Development", colorClasses: "bg-green-100 text-green-500 ring-green-500" },
  { id: "product", text: "Product", colorClasses: "bg-indigo-100 text-indigo-500 ring-indigo-500" },
  { id: "marketing", text: "Marketing", colorClasses: "bg-red-100 text-red-500 ring-red-500" },
  { id: "business", text: "Business", colorClasses: "bg-cyan-100 text-cyan-500 ring-cyan-500" },
  { id: "operation", text: "Operation", colorClasses: "bg-yellow-100 text-yellow-600 ring-yellow-500" },
];

const ASSIGNEES_DATA = ["Taha Hosseinpour", "S.H Mostafavi", "Milad Mirzaei"];
const COLUMNS = ["TODO", "DOING", "DONE"];

// --- Components ---

// 1. Task Card Component
const TaskCard = ({ task, onDragStart, onToggleSubtask, onDelete }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow flex flex-col gap-3 group relative"
    >
      {/* Header (Title + Delete Button) */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-bold text-gray-800 text-lg">{task.title}</h4>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {task.date} • {task.assignee.includes("Created") ? task.assignee : `Assigned to ${task.assignee.split(" ")[0]}`}
          </p>
        </div>
        
        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // جلوگیری از تداخل با Drag & Drop
            onDelete(task.id);
          }}
          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Delete task"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 leading-relaxed">
          {task.description}
        </p>
      )}

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {task.subtasks.map((st) => (
            <label key={st.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={st.completed}
                onChange={() => onToggleSubtask(task.id, st.id)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className={`text-sm font-medium ${st.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                {st.text}
              </span>
            </label>
          ))}
        </div>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {task.labels.map((labelId) => {
            const labelObj = LABELS_DATA.find((l) => l.id === labelId);
            if (!labelObj) return null;
            return (
              <span
                key={labelId}
                className={`text-xs font-bold px-3 py-1 rounded-md ${labelObj.colorClasses.split("ring-")[0]}`}
              >
                {labelObj.text}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 2. Sidebar Form Component
const Sidebar = ({ onAddTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([{ id: Date.now(), text: "", completed: false }]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [assignee, setAssignee] = useState("");
  const [errors, setErrors] = useState({});

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: Date.now(), text: "", completed: false }]);
  };

  const handleRemoveSubtask = (idToRemove) => {
    setSubtasks(subtasks.filter((st) => st.id !== idToRemove));
  };

  const handleSubtaskChange = (id, text) => {
    setSubtasks(subtasks.map((st) => (st.id === id ? { ...st, text } : st)));
  };

  const toggleLabel = (id) => {
    if (selectedLabels.includes(id)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== id));
    } else {
      setSelectedLabels([...selectedLabels, id]);
    }
  };

  const handleClearAll = () => {
    setTitle("");
    setDescription("");
    setSubtasks([{ id: Date.now(), text: "", completed: false }]);
    setSelectedLabels([]);
    setAssignee("");
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!assignee) newErrors.assignee = "Assignee is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      subtasks: subtasks.filter((st) => st.text.trim() !== ""),
      labels: selectedLabels,
      assignee,
      status: "TODO",
      date: dateStr,
    };

    onAddTask(newTask);
    handleClearAll();
  };

  return (
    <div className="w-full lg:w-[340px] bg-white p-6 lg:p-8 flex flex-col h-full overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            placeholder="Task title..."
            className={`w-full bg-[#F4F6F8] text-sm p-3 rounded-xl outline-none border transition-colors ${
              errors.title ? "border-red-500" : "border-transparent focus:border-gray-300"
            }`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows="3"
            className="w-full bg-[#F4F6F8] text-sm p-3 rounded-xl outline-none border border-transparent focus:border-gray-300 transition-colors resize-none"
          />
        </div>

        {/* Subtask */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              Subtask
            </label>
            <button type="button" onClick={handleAddSubtask} className="bg-black hover:bg-gray-800 transition-colors text-white p-1 rounded">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {subtasks.length === 0 && (
              <p className="text-xs text-gray-400 italic">No subtasks added.</p>
            )}
            {subtasks.map((st, index) => (
              <div key={st.id} className="flex items-center gap-2 group">
                <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-300 bg-gray-50" />
                <input
                  type="text"
                  value={st.text}
                  onChange={(e) => handleSubtaskChange(st.id, e.target.value)}
                  placeholder={index === 0 ? "e.g. Design homepage" : "Placeholder"}
                  className="flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-gray-300 py-1 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                  title="Remove subtask"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Label
          </label>
          <div className="flex flex-wrap gap-2">
            {LABELS_DATA.map((label) => {
              const isSelected = selectedLabels.includes(label.id);
              return (
                <button
                  type="button"
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                    label.colorClasses.split("ring-")[0]
                  } ${isSelected ? `ring-2 shadow-sm ${label.colorClasses.match(/ring-\w+-\d+/)[0]}` : "hover:opacity-80"}`}
                >
                  {label.text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Assignee <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-3">
            {ASSIGNEES_DATA.map((person) => (
              <label key={person} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="assignee"
                  value={person}
                  checked={assignee === person}
                  onChange={(e) => {
                    setAssignee(e.target.value);
                    if (errors.assignee) setErrors({ ...errors, assignee: null });
                  }}
                  className="w-4 h-4 text-black focus:ring-black border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">{person}</span>
              </label>
            ))}
          </div>
          {errors.assignee && <p className="text-red-500 text-xs mt-2">{errors.assignee}</p>}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-bold text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 shadow-md transition-all active:scale-[0.98]"
          >
            Create Card
          </button>
        </div>
      </form>
    </div>
  );
};

// 3. Main App / Board Component
export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  // تابع جدید برای حذف تسک
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      })
    );
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData("taskId");
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-white font-sans">
      {/* Left Sidebar */}
      <Sidebar onAddTask={handleAddTask} />

      {/* Right Kanban Board */}
      <div className="flex-1 bg-[#F4F6F8] lg:rounded-l-[40px] p-6 lg:p-10 overflow-x-auto relative">
        <div className="flex flex-col md:flex-row gap-6 min-w-max h-full">
          {COLUMNS.map((colStatus) => (
            <div
              key={colStatus}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, colStatus)}
              className="flex-1 min-w-[300px] max-w-[350px] flex flex-col gap-4"
            >
              <h2 className="font-extrabold text-xl text-black tracking-wide pl-1">
                {colStatus === "TODO" ? "TO DO" : colStatus}
              </h2>
              
              <div className="flex flex-col gap-4 h-full pb-10">
                {tasks
                  .filter((task) => task.status === colStatus)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onToggleSubtask={handleToggleSubtask}
                      onDelete={handleDeleteTask} // ارسال پراپ حذف
                    />
                  ))}
                  
                {/* Empty State visual indicator for Drag and Drop */}
                {tasks.filter((task) => task.status === colStatus).length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center text-gray-400 text-sm font-medium">
                    Drop cards here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
