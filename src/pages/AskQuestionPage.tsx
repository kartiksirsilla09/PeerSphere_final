import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { questionsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const AskQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      // We could redirect here, but instead we'll show a message in the UI
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to ask a question');
      return;
    }
    
    // Validation
    if (!question.title.trim()) {
      setError('Question title is required');
      return;
    }
    
    if (!question.content.trim()) {
      setError('Question details are required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Convert comma-separated tags into an array
      const tagsArray = question.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Submit the question
      await questionsAPI.create({
        title: question.title,
        content: question.content,
        tags: tagsArray
      });
      
      // Navigate to home page after successful submission
      navigate('/');
      
    } catch (err) {
      console.error('Error submitting question:', err);
      setError('Failed to submit your question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to ask a question on PeerSphere.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => setQuestion({ ...question, title: e.target.value })}
            className="w-full p-3 border rounded-md"
            placeholder="What's your programming question?"
            disabled={submitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Be specific and imagine you're asking a question to another person
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Details
          </label>
          <textarea
            value={question.content}
            onChange={(e) => setQuestion({ ...question, content: e.target.value })}
            rows={8}
            className="w-full p-3 border rounded-md"
            placeholder="Provide more details about your question..."
            disabled={submitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Include all the information someone would need to answer your question
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={question.tags}
            onChange={(e) => setQuestion({ ...question, tags: e.target.value })}
            className="w-full p-3 border rounded-md"
            placeholder="Add tags (separated by commas)"
            disabled={submitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Add up to 5 tags to describe what your question is about
          </p>
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          disabled={submitting}
        >
          {submitting ? 'Posting Question...' : 'Post Your Question'}
        </button>
      </form>
    </div>
  );
};

export default AskQuestionPage;
