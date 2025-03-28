import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionsAPI, authAPI } from '../lib/api';
import { Question, Answer } from '../types';
import { formatDistanceToNow, format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user's profile with populated questions and answers
        const profileResponse = await authAPI.getProfile();
        
        // Fetch detailed questions that the user has asked
        if (profileResponse.data.questionsAsked && profileResponse.data.questionsAsked.length > 0) {
          const questionsPromises = profileResponse.data.questionsAsked.map((questionId: string) => 
            questionsAPI.getById(questionId)
          );
          
          const questionsResponses = await Promise.allSettled(questionsPromises);
          const fetchedQuestions = questionsResponses
            .filter((result) => result.status === 'fulfilled')
            .map((result: any) => result.value.data);
          
          setUserQuestions(fetchedQuestions);
        }
        
        // Fetch answers that the user has posted
        if (profileResponse.data.answersGiven && profileResponse.data.answersGiven.length > 0) {
          try {
            const answersResponse = await authAPI.getUserAnswers();
            setUserAnswers(answersResponse.data);
          } catch (error) {
            console.error('Error fetching user answers:', error);
          }
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">You need to be logged in to view your profile</h2>
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-600 font-semibold">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Joined: {format(new Date(user.createdAt), 'MMMM dd, yyyy')}
              </p>
              <p className="text-sm font-medium text-blue-600">
                {user.points} points
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-semibold text-gray-700 mb-1">Questions Asked</h3>
              <p className="text-3xl font-bold text-blue-600">{userQuestions.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                {userQuestions.length === 1 ? 'contribution' : 'contributions'}
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-semibold text-gray-700 mb-1">Answers Given</h3>
              <p className="text-3xl font-bold text-green-600">{userAnswers.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                {userAnswers.length === 1 ? 'contribution' : 'contributions'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('questions')}
            >
              Your Questions
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('answers')}
            >
              Your Answers
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {activeTab === 'questions' ? (
              userQuestions.length > 0 ? (
                userQuestions.map((question) => (
                  <div key={question._id} className="p-6 hover:bg-gray-50">
                    <Link to={`/questions/${question._id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600">
                        {question.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-2">{question.content}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags && question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{question.upvotes?.length || 0} upvotes</span>
                        <span>{question.answers?.length || 0} answers</span>
                        <span>{question.views || 0} views</span>
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">You haven't asked any questions yet.</p>
                  <Link to="/ask" className="text-blue-600 hover:text-blue-700 font-medium">
                    Ask your first question
                  </Link>
                </div>
              )
            ) : (
              // Display user answers
              userAnswers.length > 0 ? (
                userAnswers.map((answer) => (
                  <div key={answer._id} className="p-6 hover:bg-gray-50">
                    <Link to={`/questions/${answer.question}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600">
                        {answer.questionTitle || 'Answer to question'}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 line-clamp-2">{answer.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{answer.upvotes?.length || 0} upvotes</span>
                        {answer.isAccepted && (
                          <span className="text-green-600 font-medium">Accepted Answer</span>
                        )}
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">You haven't answered any questions yet.</p>
                  <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
                    Browse questions to answer
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
