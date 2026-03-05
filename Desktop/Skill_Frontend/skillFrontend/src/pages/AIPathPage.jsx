import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit, Lightbulb, Sparkles } from "lucide-react";

function AIPathPage() {
  const navigate = useNavigate();
  const [skill, setSkill] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-fetch the entire profile skill set immediately on load
  useEffect(() => {
    const savedSkills = localStorage.getItem('userSkills'); 
    if (savedSkills && savedSkills !== "undefined" && savedSkills.trim() !== "") {
      // Set the input field to show your profile skills
      setSkill(savedSkills);
      // Trigger the AI request automatically using the full string
      handleFetch(savedSkills);
    }
  }, []);

  const handleFetch = async (targetSkill) => {
    // Uses the passed profile skills OR whatever is typed in the box
    const skillToQuery = targetSkill || skill;
    if (!skillToQuery) return;

    setLoading(true);
    setSuggestion(null); // Clear previous results while "Thinking"
    
    try {
      // Sends the full skill set to your refined RecommendationService
      const response = await fetch(`http://localhost:8181/api/ai/suggest?skill=${encodeURIComponent(skillToQuery)}`);
      
      if (!response.ok) throw new Error("Backend not responding");
      
      const data = await response.json();
      setSuggestion(data);
    } catch (error) {
      console.error("Error:", error);
      alert("AI Connection Error: Check your API Key or Backend SecurityConfig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <BrainCircuit size={28} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Skill Roadmap</h1>
            </div>
            {/* Added a badge to show when it's using your profile */}
            {localStorage.getItem('userSkills') && (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Sparkles size={12} /> Profile Sync On
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <input 
              type="text" 
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Enter skills (e.g. Java, SQL, React)"
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-400 transition-all font-bold text-slate-700"
              disabled={loading}
            />
            <button 
              onClick={() => handleFetch()}
              disabled={loading || !skill}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Get Roadmap"}
            </button>
          </div>
        </motion.div>

        {suggestion && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 space-y-8"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Recommended Career Path</h2>
              <h2 className="text-4xl font-black mb-4">{suggestion.nextStep}</h2>
              <p className="text-indigo-100 text-lg italic opacity-90 leading-relaxed">"{suggestion.explanation}"</p>
            </div>

            {suggestion.relatedSkills && (
              <div className="bg-white rounded-[2.5rem] p-10 shadow-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-6 text-amber-500">
                  <Lightbulb size={24} />
                  <h3 className="text-xl font-black text-slate-800">Skills to Master Next</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {suggestion.relatedSkills.map((s, i) => (
                    <span key={i} className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AIPathPage;