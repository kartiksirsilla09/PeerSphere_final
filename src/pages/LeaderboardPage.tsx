import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { Trophy, Award, Medal, HelpCircle, MessageSquare } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  username: string;
  points: number;
  questionsAsked: any[];
  answersGiven: any[];
}

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getLeaderboard();
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      
      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No users have earned points yet.</p>
          <p className="text-gray-600">
            Be the first to <Link to="/ask" className="text-blue-600 hover:underline">ask a question</Link> or
            answer others' questions to earn points!
          </p>
        </div>
      ) : (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <HelpCircle size={14} className="mr-1" />
                    Questions
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <MessageSquare size={14} className="mr-1" />
                    Answers
                  </div>
                </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
                <tr key={user._id} className={index < 3 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {index === 0 ? (
                      <Trophy className="inline text-yellow-500" size={20} />
                    ) : index === 1 ? (
                      <Medal className="inline text-gray-400" size={20} />
                    ) : index === 2 ? (
                      <Award className="inline text-amber-600" size={20} />
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-xs text-blue-600 font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{user.points}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {Array.isArray(user.questionsAsked) ? user.questionsAsked.length : 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {Array.isArray(user.answersGiven) ? user.answersGiven.length : 0}
                    </span>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Earn Points</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Question upvote: +10 points</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Answer upvote: +10 points</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Answer accepted: +15 points</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Ask a question: +5 points</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Answer a question: +10 points</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Question downvote: -2 points</li>
          <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Answer downvote: -2 points</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaderboardPage;
