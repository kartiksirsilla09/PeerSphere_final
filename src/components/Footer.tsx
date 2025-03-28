import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">PeerSphere</h3>
            <p className="text-gray-600 mb-4">
              A platform for college students to connect with seniors, ask questions, and share experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link></li>
              <li><Link to="/leaderboard" className="text-gray-600 hover:text-blue-600">Leaderboard</Link></li>
              <li><Link to="/ask" className="text-gray-600 hover:text-blue-600">Ask Question</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-600">© {new Date().getFullYear()} PeerSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;