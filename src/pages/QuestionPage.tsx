import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Question, Answer } from '../types';
import { questionsAPI, answersAPI } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, AlertCircle, User } from 'lucide-react';

const QuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await questionsAPI.getById(id);
        setQuestion(response.data);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load the question. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [id]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear active animation after it completes
  useEffect(() => {
    if (activeAnimation) {
      const timer = setTimeout(() => {
        setActiveAnimation(null);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [activeAnimation]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setAnswerError('You must be logged in to answer a question');
      return;
    }
    
    if (!id) {
      setAnswerError('Invalid question ID');
      return;
    }
    
    if (!newAnswer.trim()) {
      setAnswerError('Answer cannot be empty');
      return;
    }
    
    try {
      setSubmitting(true);
      setAnswerError(null);
      
      await answersAPI.create(id, { content: newAnswer });
      
      // Refetch the question to get the updated list of answers
      const response = await questionsAPI.getById(id);
      setQuestion(response.data);
      
      // Clear the answer field
      setNewAnswer('');
      setSuccessMessage('Your answer has been posted successfully!');
      
    } catch (err) {
      console.error('Error submitting answer:', err);
      setAnswerError('Failed to submit your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      setError('You must be logged in to upvote');
      return;
    }
    
    if (!id || !question) return;

    // Check if user has already upvoted
    const alreadyUpvoted = question.upvotes?.includes(user._id);
    if (alreadyUpvoted) {
      setError('You have already upvoted this question');
      return;
    }

    // Check if user has already downvoted (they'll be removing their downvote)
    const alreadyDownvoted = question.downvotes?.includes(user._id);

    try {
      setVoteLoading(true);
      setActiveAnimation('upvote');
      await questionsAPI.upvote(id);
      
      // Refetch the question to get updated upvotes
      const response = await questionsAPI.getById(id);
      setQuestion(response.data);
      
      // Clear any previous errors
      setError(null);
      
      if (alreadyDownvoted) {
        setSuccessMessage('Your downvote has been changed to an upvote!');
      } else {
        setSuccessMessage('Question upvoted successfully!');
      }
    } catch (err) {
      console.error('Error upvoting question:', err);
      setError('Failed to upvote the question. Please try again.');
    } finally {
      setVoteLoading(false);
    }
  };

  const handleDownvote = async () => {
    if (!user) {
      setError('You must be logged in to downvote');
      return;
    }
    
    if (!id || !question) return;

    // Check if user has already downvoted
    const alreadyDownvoted = question.downvotes?.includes(user._id);
    if (alreadyDownvoted) {
      setError('You have already downvoted this question');
      return;
    }

    // Check if user has already upvoted (they'll be removing their upvote)
    const alreadyUpvoted = question.upvotes?.includes(user._id);

    try {
      setVoteLoading(true);
      setActiveAnimation('downvote');
      await questionsAPI.downvote(id);
      
      // Refetch the question to get updated downvotes
      const response = await questionsAPI.getById(id);
      setQuestion(response.data);
      
      // Clear any previous errors
      setError(null);
      
      if (alreadyUpvoted) {
        setSuccessMessage('Your upvote has been changed to a downvote.');
      } else {
        setSuccessMessage('Question downvoted.');
      }
    } catch (err) {
      console.error('Error downvoting question:', err);
      setError('Failed to downvote the question. Please try again.');
    } finally {
      setVoteLoading(false);
    }
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    if (!user) {
      setError('You must be logged in to upvote');
      return;
    }
    
    try {
      setVoteLoading(true);
      setActiveAnimation(`upvote-${answerId}`);
      await answersAPI.upvote(answerId);
      
      // Refetch the question to get updated answer votes
      if (id) {
        const response = await questionsAPI.getById(id);
        setQuestion(response.data);
      }
      
      // Clear any previous errors
      setError(null);
      setSuccessMessage('Answer upvoted successfully!');
    } catch (err) {
      console.error('Error upvoting answer:', err);
      setError('Failed to upvote the answer. Please try again.');
    } finally {
      setVoteLoading(false);
    }
  };

  const handleDownvoteAnswer = async (answerId: string) => {
    if (!user) {
      setError('You must be logged in to downvote');
      return;
    }
    
    try {
      setVoteLoading(true);
      setActiveAnimation(`downvote-${answerId}`);
      await answersAPI.downvote(answerId);
      
      // Refetch the question to get updated answer votes
      if (id) {
        const response = await questionsAPI.getById(id);
        setQuestion(response.data);
      }
      
      // Clear any previous errors
      setError(null);
      setSuccessMessage('Answer downvoted.');
    } catch (err) {
      console.error('Error downvoting answer:', err);
      setError('Failed to downvote the answer. Please try again.');
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !question) {
  return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl shadow-sm p-10 animate-fade-in">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Question not found'}</p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg transition-transform hover:scale-105 hover:bg-blue-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has already upvoted or downvoted
  const userUpvoted = user && question.upvotes?.includes(user._id);
  const userDownvoted = user && question.downvotes?.includes(user._id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center shadow-sm animate-slide-in-top">
          <AlertCircle size={18} className="mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 flex items-center shadow-sm animate-slide-in-top">
          <CheckCircle size={18} className="mr-3 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{question.title}</h1>
          <p className="text-gray-600 mb-6 whitespace-pre-line leading-relaxed">{question.content}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags && question.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full transition-transform hover:scale-105"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
            <div className="flex items-center gap-4">
              <button 
                className={`flex items-center p-2 rounded-lg transition-all ${
                  activeAnimation === 'upvote' ? 'animate-pulse-once' : ''
                } ${
                  userUpvoted 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-50 hover:-translate-y-1'
                }`}
                onClick={handleUpvote}
                disabled={voteLoading || !user}
                title={user ? "Upvote this question" : "Log in to upvote"}
              >
                <ThumbsUp size={18} className={`mr-2 transition-colors ${userUpvoted ? 'fill-blue-600 text-blue-600' : ''}`} />
                <span className="font-medium">{question.upvotes ? question.upvotes.length : 0}</span>
              </button>
              
              <button 
                className={`flex items-center p-2 rounded-lg transition-all ${
                  activeAnimation === 'downvote' ? 'animate-pulse-once' : ''
                } ${
                  userDownvoted 
                    ? 'bg-red-50 text-red-600' 
                    : 'hover:bg-gray-50 hover:translate-y-1'
                }`}
                onClick={handleDownvote}
                disabled={voteLoading || !user}
                title={user ? "Downvote this question" : "Log in to downvote"}
              >
                <ThumbsDown size={18} className={`mr-2 transition-colors ${userDownvoted ? 'fill-red-600 text-red-600' : ''}`} />
                <span className="font-medium">{question.downvotes ? question.downvotes.length : 0}</span>
              </button>
              
              <div className="flex items-center p-2">
                <MessageSquare size={18} className="mr-2 text-gray-400" />
                <span className="font-medium">{question.answers ? question.answers.length : 0}</span>
        </div>
      </div>

            <div className="flex items-center">
              <div className="flex items-center mr-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-2 shadow-sm">
                  <span className="text-xs text-white font-medium">
                    {question.author?.username ? question.author.username.charAt(0).toUpperCase() : <User size={12} />}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">
                  {question.author?.username || 'Unknown'}
                </span>
              </div>
              <span className="text-gray-400">
                {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <MessageSquare size={18} className="mr-2 text-blue-500" />
          {question.answers && question.answers.length > 0 
            ? `${question.answers.length} Answers` 
            : 'No answers yet'}
        </h2>
        
        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-6">
            {question.answers.map((answer) => {
              // Check if user has already upvoted or downvoted this answer
              const userUpvotedAnswer = user && answer.upvotes?.includes(user._id);
              const userDownvotedAnswer = user && answer.downvotes?.includes(user._id);
              
              return (
                <div key={answer._id}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md animate-fade-in">
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 whitespace-pre-line leading-relaxed">{answer.content}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                        <div className="flex items-center gap-4">
                          <button 
                            className={`flex items-center p-2 rounded-lg transition-all ${
                              activeAnimation === `upvote-${answer._id}` ? 'animate-pulse-once' : ''
                            } ${
                              userUpvotedAnswer 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'hover:bg-gray-50 hover:-translate-y-1'
                            }`}
                            onClick={() => handleUpvoteAnswer(answer._id)}
                            disabled={voteLoading || !user}
                            title={user ? "Upvote this answer" : "Log in to upvote"}
                          >
                            <ThumbsUp size={18} className={`mr-2 ${userUpvotedAnswer ? 'fill-blue-600 text-blue-600' : ''}`} />
                            <span className="font-medium">{answer.upvotes ? answer.upvotes.length : 0}</span>
                          </button>
                          
                          <button 
                            className={`flex items-center p-2 rounded-lg transition-all ${
                              activeAnimation === `downvote-${answer._id}` ? 'animate-pulse-once' : ''
                            } ${
                              userDownvotedAnswer 
                                ? 'bg-red-50 text-red-600' 
                                : 'hover:bg-gray-50 hover:translate-y-1'
                            }`}
                            onClick={() => handleDownvoteAnswer(answer._id)}
                            disabled={voteLoading || !user}
                            title={user ? "Downvote this answer" : "Log in to downvote"}
                          >
                            <ThumbsDown size={18} className={`mr-2 ${userDownvotedAnswer ? 'fill-red-600 text-red-600' : ''}`} />
                            <span className="font-medium">{answer.downvotes ? answer.downvotes.length : 0}</span>
                          </button>
                          
                          {answer.isAccepted && (
                            <div className="flex items-center p-2 rounded-lg bg-green-50 text-green-600">
                              <CheckCircle size={18} className="mr-2" />
                              <span className="font-medium">Accepted</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center mr-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-2 shadow-sm">
                              <span className="text-xs text-white font-medium">
                                {answer.author?.username ? answer.author.username.charAt(0).toUpperCase() : <User size={12} />}
                              </span>
                            </div>
                            <span className="text-gray-700 font-medium">
                              {answer.author?.username || 'Unknown'}
                            </span>
                          </div>
                          <span className="text-gray-400">
                            {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 animate-fade-in">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg">Be the first to answer this question!</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md animate-fade-in">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <MessageSquare size={18} className="mr-2 text-blue-500" />
            Your Answer
          </h2>
          
          {!user && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 transition-all">
              <p>You need to <Link to="/login" className="text-blue-600 hover:underline font-medium">log in</Link> to post an answer.</p>
            </div>
          )}
          
          {answerError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 flex items-center animate-shake">
              <AlertCircle size={18} className="mr-3 flex-shrink-0" />
              <p>{answerError}</p>
            </div>
          )}
          
        <form onSubmit={handleSubmitAnswer}>
          <textarea
              className="w-full p-4 border border-gray-200 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
            rows={6}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your answer here..."
              disabled={!user || submitting}
          />
            <div className="flex justify-between items-center">
          <button
            type="submit"
                className={`px-6 py-3 rounded-lg transition-all transform ${
                  !user || submitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95 shadow-sm'
                }`}
                disabled={!user || submitting}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Posting...
                  </span>
                ) : (
                  'Post Your Answer'
                )}
          </button>
              
              {!user && (
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-all hover:underline"
                >
                  Log in to answer
                </Link>
              )}
            </div>
        </form>
        </div>
      </div>
    </div>
  );
};

// Add these animations to your Tailwind config or use styles directly
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInTop {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulseOnce {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  .animate-slide-in-top {
    animation: slideInTop 0.4s ease-out;
  }
  
  .animate-pulse-once {
    animation: pulseOnce 0.6s ease-in-out;
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);

export default QuestionPage;
