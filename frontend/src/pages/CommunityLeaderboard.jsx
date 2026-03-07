import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Star, TrendingUp, Users, MessageCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const badgeConfig = {
  'beginner-farmer': {
    name: 'Beginner Farmer',
    icon: '🌱',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300'
  },
  'active-helper': {
    name: 'Active Helper',
    icon: '🤝',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-300'
  },
  'expert-farmer': {
    name: 'Expert Farmer',
    icon: '⭐',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300'
  },
  'community-leader': {
    name: 'Community Leader',
    icon: '👑',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300'
  }
};

const CommunityLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myReputation, setMyReputation] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, myRepRes, statsRes] = await Promise.all([
        api.get(`/reputation/leaderboard?timeframe=${timeframe}&limit=50`),
        api.get('/reputation/me'),
        api.get('/reputation/stats')
      ]);

      setLeaderboard(leaderboardRes.data.data);
      setMyReputation(myRepRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="font-bold text-gray-600">{rank}</span>;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title="Community Leaderboard" />
        <div className="p-8 mt-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Top Farmers Leaderboard
            </h1>
            <p className="text-gray-600">
              Earn points by helping other farmers and contributing to the community
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Active Members</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalPoints?.toLocaleString() || 0}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Points</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {myReputation?.statistics?.totalAnswers || 0}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Your Answers</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {myReputation?.statistics?.helpfulAnswers || 0}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Helpful Answers</h3>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* My Ranking Card */}
            <div className="col-span-4">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm border border-green-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Your Ranking
                </h3>

                {myReputation && (
                  <div className="space-y-4">
                    {/* Badge Display */}
                    <div className={`flex items-center justify-center py-6 px-4 rounded-lg border-2 ${badgeConfig[myReputation.badge].bg} ${badgeConfig[myReputation.badge].border}`}>
                      <div className="text-center">
                        <div className="text-5xl mb-2">{badgeConfig[myReputation.badge].icon}</div>
                        <h4 className={`text-lg font-bold ${badgeConfig[myReputation.badge].color}`}>
                          {badgeConfig[myReputation.badge].name}
                        </h4>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {myReputation.points}
                      </div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Posts Created</span>
                        <span className="font-semibold text-gray-900">
                          {myReputation.statistics.totalPosts}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Answers</span>
                        <span className="font-semibold text-gray-900">
                          {myReputation.statistics.totalAnswers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Helpful Answers</span>
                        <span className="font-semibold text-green-600">
                          {myReputation.statistics.helpfulAnswers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Helpful Votes</span>
                        <span className="font-semibold text-purple-600">
                          {myReputation.statistics.totalHelpfulVotes}
                        </span>
                      </div>
                    </div>

                    {/* Next Badge Progress */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Progress to Next Badge</div>
                      {myReputation.badge === 'community-leader' ? (
                        <div className="text-center py-2">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <div className="text-sm text-green-600 font-medium">Max Level Achieved!</div>
                        </div>
                      ) : (
                        <>
                          {myReputation.badge === 'beginner-farmer' && (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div 
                                  className="bg-blue-600 h-3 rounded-full transition-all"
                                  style={{ width: `${(myReputation.points / 100) * 100}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-600 text-center">
                                {myReputation.points} / 100 points to Active Helper 🤝
                              </div>
                            </>
                          )}
                          {myReputation.badge === 'active-helper' && (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div 
                                  className="bg-purple-600 h-3 rounded-full transition-all"
                                  style={{ width: `${((myReputation.points - 100) / 400) * 100}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-600 text-center">
                                {myReputation.points} / 500 points to Expert Farmer ⭐
                              </div>
                            </>
                          )}
                          {myReputation.badge === 'expert-farmer' && (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div 
                                  className="bg-yellow-600 h-3 rounded-full transition-all"
                                  style={{ width: `${((myReputation.points - 500) / 500) * 100}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-600 text-center">
                                {myReputation.points} / 1000 points to Community Leader 👑
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* How to Earn Points */}
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">How to Earn Points</h4>
                      <ul className="space-y-2 text-xs text-gray-700">
                        <li className="flex justify-between">
                          <span>• Post a question/problem</span>
                          <span className="font-semibold text-green-600">+5</span>
                        </li>
                        <li className="flex justify-between">
                          <span>• Reply to help someone</span>
                          <span className="font-semibold text-green-600">+10</span>
                        </li>
                        <li className="flex justify-between">
                          <span>• Helpful answer</span>
                          <span className="font-semibold text-green-600">+15</span>
                        </li>
                        <li className="flex justify-between">
                          <span>• Best answer</span>
                          <span className="font-semibold text-green-600">+25</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="col-span-8">
              {/* Timeframe Filter */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Timeframe:</span>
                  <div className="flex gap-2">
                    {['all', 'week', 'month', 'year'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeframe(period)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          timeframe === period
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Top 3 */}
                {leaderboard.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                      {/* 2nd Place */}
                      {leaderboard[1] && (
                        <div className="text-center">
                          <div className="text-4xl mb-2">🥈</div>
                          <div className="font-semibold text-gray-900">{leaderboard[1].user?.name || 'Unknown'}</div>
                          <div className="text-lg font-bold text-gray-700">{leaderboard[1].points} points</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${badgeConfig[leaderboard[1].badge].bg} ${badgeConfig[leaderboard[1].badge].color}`}>
                            {badgeConfig[leaderboard[1].badge].icon} {badgeConfig[leaderboard[1].badge].name}
                          </div>
                        </div>
                      )}

                      {/* 1st Place */}
                      {leaderboard[0] && (
                        <div className="text-center transform scale-110">
                          <div className="text-5xl mb-2">🏆</div>
                          <div className="font-bold text-gray-900 text-lg">{leaderboard[0].user?.name || 'Unknown'}</div>
                          <div className="text-2xl font-bold text-yellow-600">{leaderboard[0].points} points</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${badgeConfig[leaderboard[0].badge].bg} ${badgeConfig[leaderboard[0].badge].color}`}>
                            {badgeConfig[leaderboard[0].badge].icon} {badgeConfig[leaderboard[0].badge].name}
                          </div>
                        </div>
                      )}

                      {/* 3rd Place */}
                      {leaderboard[2] && (
                        <div className="text-center">
                          <div className="text-4xl mb-2">🥉</div>
                          <div className="font-semibold text-gray-900">{leaderboard[2].user?.name || 'Unknown'}</div>
                          <div className="text-lg font-bold text-gray-700">{leaderboard[2].points} points</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${badgeConfig[leaderboard[2].badge].bg} ${badgeConfig[leaderboard[2].badge].color}`}>
                            {badgeConfig[leaderboard[2].badge].icon} {badgeConfig[leaderboard[2].badge].name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rest of leaderboard */}
                <div className="divide-y divide-gray-200">
                  {leaderboard.slice(3).map((user, index) => (
                    <div 
                      key={user._id} 
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-8 text-center">
                          {getRankMedal(index + 4)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {user.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.user?.region || 'Azerbaijan'}
                          </div>
                        </div>

                        {/* Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${badgeConfig[user.badge].bg} ${badgeConfig[user.badge].color}`}>
                          {badgeConfig[user.badge].icon} {badgeConfig[user.badge].name}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{user.statistics.totalAnswers}</div>
                            <div className="text-xs text-gray-600">Answers</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{user.statistics.helpfulAnswers}</div>
                            <div className="text-xs text-gray-600">Helpful</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-600">{user.points}</div>
                            <div className="text-xs text-gray-600">Points</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {leaderboard.length === 0 && (
                  <div className="p-12 text-center">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No rankings available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLeaderboard;
