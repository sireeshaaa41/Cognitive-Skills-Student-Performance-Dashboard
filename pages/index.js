// pages/index.js
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer
} from "recharts";
import fs from "fs";
import path from "path";

// Helper function to calculate averages
function avg(arr, key) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, a) => s + (a[key] || 0), 0) / arr.length);
}

export default function Home({ students }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("student_id");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState(students[0] || null);

  // Filter by search
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort students
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const A = a[sortBy], B = b[sortBy];
      if (typeof A === "string") {
        return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      }
      return sortDir === "asc" ? A - B : B - A;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  // Overview stats
  const overview = {
    avg_assessment: avg(students, "assessment_score"),
    avg_comprehension: avg(students, "comprehension"),
    avg_attention: avg(students, "attention"),
    avg_focus: avg(students, "focus"),
    avg_retention: avg(students, "retention"),
    avg_engagement: avg(students, "engagement_time"),
  };

  // Insights
  const topCorrFeatures = ["comprehension", "attention", "focus"];
  const insightLines = [
    `📌 Average assessment score: ${overview.avg_assessment}`,
    `📈 Top features correlated with performance: ${topCorrFeatures.join(", ")}`,
    `👥 Cluster sizes are available in the Jupyter notebook.`,
    `📊 Try clicking a row in the table to see that student's profile.`,
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Student Performance Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <div className="text-sm text-gray-500">Avg Assessment</div>
          <div className="text-2xl font-semibold">{overview.avg_assessment}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <div className="text-sm text-gray-500">Avg Comprehension</div>
          <div className="text-2xl font-semibold">{overview.avg_comprehension}</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <div className="text-sm text-gray-500">Avg Engagement (min)</div>
          <div className="text-2xl font-semibold">{overview.avg_engagement}</div>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search students..."
          className="border p-2 flex-1 rounded"
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border p-2 rounded">
          <option value="student_id">ID</option>
          <option value="name">Name</option>
          <option value="assessment_score">Score</option>
          <option value="cluster">Persona</option>
        </select>
        <button
          onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
          className="border px-4 rounded bg-white"
        >
          {sortDir === "asc" ? "⬆ Asc" : "⬇ Desc"}
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Attention vs Assessment (Scatter)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <XAxis dataKey="attention" name="Attention" />
              <YAxis dataKey="assessment_score" name="Score" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={students} fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Assessment Scores (Bar)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={students.slice(0, 30)}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="assessment_score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Student Profile</h3>
          {selected ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { skill: "comprehension", value: selected.comprehension },
                { skill: "attention", value: selected.attention },
                { skill: "focus", value: selected.focus },
                { skill: "retention", value: selected.retention },
                { skill: "engagement", value: selected.engagement_time },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis />
                <Radar dataKey="value" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <div>No student selected</div>}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Insights</h3>
          <ul className="list-disc ml-5">
            {insightLines.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <h3 className="font-semibold mb-2">Student Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Score</th>
                <th className="border p-2">Persona</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => (
                <tr
                  key={s.student_id}
                  onClick={() => setSelected(s)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="border p-2">{s.student_id}</td>
                  <td className="border p-2">{s.name}</td>
                  <td className="border p-2">{s.assessment_score}</td>
                  <td className="border p-2">{s.cluster ?? s.persona ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------
// getStaticProps to load students.json
// ----------------------------------
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data", "students.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const students = JSON.parse(jsonData);

  return {
    props: { students },
  };
}