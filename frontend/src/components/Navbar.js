import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  FaWallet, 
  FaGraduationCap, 
  FaShieldAlt, 
  FaImages, 
  FaChartBar,
  FaCrown,
  FaUser,
  FaSignOutAlt,
  FaCog
} from 'react-icons/fa';

const Navbar = () => {
  const { isConnected, account, userType, isOwner, ownerAddress, connectWallet, disconnectWallet } = useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: FaGraduationCap },
    { name: 'Đăng ký thi', href: '/register', icon: FaUser },
    { name: 'Xác minh', href: '/verify', icon: FaShieldAlt },
    { name: 'Thi', href: '/exam', icon: FaGraduationCap },
    { name: 'NFT Gallery', href: '/nft-gallery', icon: FaImages },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: FaCrown },
    { name: 'MetaMask Admin', href: '/metamask-admin', icon: FaWallet },
  ];

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setShowUserMenu(false);
  };

  const getNavItems = () => {
    if (userType === 'owner' || isOwner) {
      return [...navigation, ...adminNavigation];
    }
    return navigation;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getUserTypeLabel = () => {
    if (userType === 'owner' || isOwner) {
      return 'Admin';
    }
    return 'Sinh viên';
  };

  const getUserTypeColor = () => {
    if (userType === 'owner' || isOwner) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <FaGraduationCap className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Exam Blockchain
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-1" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor()}`}>
                      {getUserTypeLabel()}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatAddress(account)}
                    </span>
                    <FaCog className="text-gray-500 text-sm" />
                  </div>
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {getUserTypeLabel()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {account}
                      </p>
                      {ownerAddress && (userType === 'owner' || isOwner) && (
                        <p className="text-xs text-gray-400 mt-1">
                          Owner: {formatAddress(ownerAddress)}
                        </p>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Chọn vai trò khác
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      {(userType === 'owner' || isOwner) && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleDisconnectWallet}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FaSignOutAlt className="inline mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                <FaWallet className="mr-2" />
                Kết nối ví
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="mr-2" />
                  {item.name}
                </Link>
              );
            })}
            
            {isConnected && (
              <div className="px-3 py-2 border-t border-gray-200 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {formatAddress(account)}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor()}`}>
                    {getUserTypeLabel()}
                  </span>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="mt-2 w-full text-left text-sm text-red-600 hover:text-red-700"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 
 