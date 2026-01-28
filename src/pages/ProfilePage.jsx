import React, { useState } from 'react';
import { FiUser, FiLock, FiSettings, FiShield, FiCheck, FiStore, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AccountSettings from '../components/user/Profile/AccountSettings';
import PasswordChange from '../components/user/Profile/PasswordChange';
import PreferencesSettings from '../components/user/Profile/PreferencesSettings';
import SecuritySettings from '../components/user/Profile/SecuritySettings';

export const ProfilePage = () => {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: FiUser, component: AccountSettings },
    { id: 'password', label: 'Password', icon: FiLock, component: PasswordChange },
    { id: 'preferences', label: 'Preferences', icon: FiSettings, component: PreferencesSettings },
    { id: 'security', label: 'Security', icon: FiShield, component: SecuritySettings }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AccountSettings;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            {userData?.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {userData?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {userData?.displayName || 'User'}
                </h1>
                {userData?.verified && (
                  <div className="relative group" title="Verified Member">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full shadow-md hover:bg-blue-600 transition cursor-help">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      Verified Member
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-2">
                {userData?.email}
              </p>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recently'}
                </p>
                {userData?.verified && userData?.verifiedAt && (
                  <p className="text-sm text-blue-600 font-medium">
                    ✓ Verified on {new Date(userData.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="mt-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${
                  userData?.role === 'vendor'
                    ? 'bg-green-100 text-green-800'
                    : userData?.role === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userData?.role === 'vendor' ? (
                    <>
                      <FiStore size={18} />
                      Vendor
                    </>
                  ) : userData?.role === 'admin' ? (
                    <>
                      <FiShield size={18} />
                      Admin
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={18} />
                      Buyer
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex overflow-x-auto border-b">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-orange-500'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
