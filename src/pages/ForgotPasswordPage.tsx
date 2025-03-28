import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, Key, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);

  const { forgotPassword, verifyOTP, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Update local error state when context error changes
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setIsLoading(false);
    }
  }, [error]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await forgotPassword(email);
      setSuccessMessage(response.message);
      
      // For dev environments only - show the email preview link
      if (response.emailPreview) {
        setEmailPreview(response.emailPreview);
      }
      
      setStep('otp');
    } catch (error: any) {
      // Error is handled by the context
      console.error('Request OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!otp.trim()) {
      setErrorMessage('Please enter the OTP sent to your email');
      return;
    }

    try {
      setIsLoading(true);
      await verifyOTP(email, otp);
      // After successful OTP verification, the user will be redirected to home
      // by the useEffect hook that checks for user auth status
    } catch (error: any) {
      // Error is handled by the context
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' ? 'Forgot Password' : 'Enter OTP'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email' 
              ? 'Enter your email to receive a verification code'
              : 'Enter the verification code sent to your email'
            }
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
            <AlertCircle size={18} className="mr-2" />
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center" role="alert">
            <CheckCircle size={18} className="mr-2" />
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        {emailPreview && (
          <div className="text-center text-sm">
            <p className="mb-2">This is a development environment. View the email at:</p>
            <a 
              href={emailPreview} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 underline"
            >
              View Email Preview
            </a>
          </div>
        )}

        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <Link to="/login" className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                <ArrowLeft size={16} className="mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <label htmlFor="otp" className="sr-only">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={20} className="text-gray-400" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <button 
                type="button" 
                onClick={() => setStep('email')} 
                className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back
              </button>
              
              <button 
                type="button" 
                onClick={handleRequestOTP} 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                disabled={isLoading}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 