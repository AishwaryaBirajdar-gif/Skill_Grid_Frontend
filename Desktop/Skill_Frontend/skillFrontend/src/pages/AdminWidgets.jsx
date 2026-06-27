import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminWidgets = () => {
    const [pendingSkills, setPendingSkills] = useState([]);
    const [recentSwaps, setRecentSwaps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch deep-dive profile skills waiting for approval
                const skillsRes = await axios.get('http://localhost:8181/api/admin/detailed-skills/pending');
                setPendingSkills(skillsRes.data);

                // 2. Fetch recent exchange transactions
                const swapsRes = await axios.get('http://localhost:8181/api/admin/swaps/recent');
                setRecentSwaps(swapsRes.data);
            } catch (err) {
                console.error("Error loading admin dashboard widgets:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px', color: '#4a00e0' }}>Loading updates...</div>;
    }

    return (
        <div style={{ display: 'flex', gap: '24px', margin: '20px 0', flexWrap: 'wrap', width: '100%' }}>
            
            {/* 1. Skills Pending Approval Grid */}
            <div style={{ 
                flex: 1, 
                minWidth: '450px', 
                backgroundColor: '#fff', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '18px', fontWeight: '600' }}>Skills Pending Approval</h3>
                    <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {pendingSkills.length} Action Required
                    </span>
                </div>
                
                {pendingSkills.length === 0 ? (
                    <p style={{ color: '#718096', fontSize: '14px' }}>All user skills are currently fully approved and verified!</p>
                ) : (
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        <table width="100%" style={{ textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #edf2f7', color: '#a0aec0', fontSize: '12px', textTransform: 'uppercase' }}>
                                    <th style={{ paddingBottom: '10px' }}>User</th>
                                    <th style={{ paddingBottom: '10px' }}>Skill Tag</th>
                                    <th style={{ paddingBottom: '10px' }}>AI-Context Bio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingSkills.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', fontSize: '14px' }}>
                                        <td style={{ padding: '12px 0', fontWeight: '500', color: '#2d3748' }}>{item.userName}</td>
                                        <td>
                                            <span style={{ background: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                                                {item.skillName}
                                            </span>
                                        </td>
                                        <td style={{ color: '#4a5568', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.description}>
                                            {item.description || "No bio summary provided"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 2. Recent Swap Activity Grid */}
            <div style={{ 
                flex: 1, 
                minWidth: '450px', 
                backgroundColor: '#fff', 
                padding: '24px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0'
            }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#2d3748', fontSize: '18px', fontWeight: '600' }}>Recent Swap Activity</h3>
                
                {recentSwaps.length === 0 ? (
                    <p style={{ color: '#718096', fontSize: '14px' }}>No active transactions log found in database.</p>
                ) : (
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                            {recentSwaps.map((swap, idx) => (
                                <li key={idx} style={{ 
                                    padding: '12px 0', 
                                    borderBottom: '1px solid #edf2f7', 
                                    fontSize: '14px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ color: '#2d3748' }}>
                                        <strong>{swap.senderName || 'User'}</strong> requested swap token for 
                                        <span style={{ color: '#4a00e0', fontWeight: '600' }}> {swap.title || 'Skill Pack'}</span>
                                    </div>
                                    <span style={{ 
                                        fontSize: '11px', 
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase',
                                        backgroundColor: swap.status === 'Completed' ? '#d1fae5' : '#e0e7ff',
                                        color: swap.status === 'Completed' ? '#065f46' : '#3730a3'
                                    }}>
                                        {swap.status || 'Pending'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminWidgets;