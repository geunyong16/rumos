// frontend/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Components
import PropertyCard from '../components/properties/PropertyCard';

const Home = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalProperties: 0,
    verifiedAgents: 0,
    happyCustomers: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/properties/recent?limit=6`)
        ]);
        
        setRecentProperties(propertiesResponse.data.properties);
        
        // Mock stats - 실제로는 API에서 가져와야 함
        setStats({
          totalProperties: 1200,
          verifiedAgents: 150,
          happyCustomers: 3500
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(t('common.errorFetchingProperties'));
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
          <svg className="absolute bottom-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
            <path d="M0,400 C150,300 350,200 600,250 C850,300 1050,200 1200,100 L1200,400 Z" fill="rgba(255,255,255,0.1)"></path>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">{t('title')}</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-100 sm:max-w-3xl">
              {t('subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="mt-10 max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by location or property type..."
                    className="w-full px-6 py-4 text-lg border-0 rounded-l-lg focus:ring-2 focus:ring-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-yellow-500 text-black font-semibold rounded-r-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/properties"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 shadow-lg"
              >
                {t('exploreProperties')}
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-indigo-700 transition-colors"
              >
                {t('getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {stats.totalProperties.toLocaleString()}+
              </div>
              <div className="text-lg text-gray-600">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {stats.verifiedAgents.toLocaleString()}+
              </div>
              <div className="text-lg text-gray-600">Verified Agents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {stats.happyCustomers.toLocaleString()}+
              </div>
              <div className="text-lg text-gray-600">Satisfied Customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('recentListings')}
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            {t('recentListingsDescription')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recentProperties.map((property) => (
                <PropertyCard key={property.property_id} property={property} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/properties"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200"
              >
                {t('viewAllProperties')}
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">{t('whyChooseUs')}</h2>
            <p className="mt-4 text-xl text-gray-600">
              {t('whyChooseUsDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ),
                title: t('features.easyToUse.title'),
                description: t('features.easyToUse.description'),
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: t('features.verifiedAgents.title'),
                description: t('features.verifiedAgents.description'),
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                ),
                title: t('features.multiLanguage.title'),
                description: t('features.multiLanguage.description'),
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: t('features.community.title'),
                description: t('features.community.description'),
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600">
              Find your ideal home in 3 easy steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Search',
                description: 'Enter your preferred area and conditions to search properties.',
                icon: (
                  <svg className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Browse Listings',
                description: 'Check detailed information and photos, and save listings you like.',
                icon: (
                  <svg className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Contact Agent',
                description: 'Contact the agent directly if you find a property you like.',
                icon: (
                  <svg className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">{t('readyToStart')}</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            {t('readyToStartDescription')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transform hover:scale-105 transition-all duration-200"
            >
              {t('createAccount')}
            </Link>
            <Link
              to="/register/agent"
              className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-indigo-600 transition-colors"
            >
              중개사로 등록하기
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Link Section */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Properties</h3>
              <ul className="mt-4 space-y-4">
                <li><Link to="/properties?type=apartment" className="text-base text-gray-300 hover:text-white">Apartment</Link></li>
                <li><Link to="/properties?type=officetel" className="text-base text-gray-300 hover:text-white">Officetel</Link></li>
                <li><Link to="/properties?type=house" className="text-base text-gray-300 hover:text-white">House</Link></li>
                <li><Link to="/properties?type=studio" className="text-base text-gray-300 hover:text-white">Studio</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Locations</h3>
              <ul className="mt-4 space-y-4">
                <li><Link to="/properties?city=Seoul" className="text-base text-gray-300 hover:text-white">Seoul</Link></li>
                <li><Link to="/properties?city=Busan" className="text-base text-gray-300 hover:text-white">Busan</Link></li>
                <li><Link to="/properties?city=Incheon" className="text-base text-gray-300 hover:text-white">Incheon</Link></li>
                <li><Link to="/properties?city=Daegu" className="text-base text-gray-300 hover:text-white">Daegu</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Services</h3>
              <ul className="mt-4 space-y-4">
                <li><Link to="/board" className="text-base text-gray-300 hover:text-white">Community</Link></li>
                <li><Link to="/register/agent" className="text-base text-gray-300 hover:text-white">Become an Agent</Link></li>
                <li><Link to="/favorites" className="text-base text-gray-300 hover:text-white">Favorites</Link></li>
                <li><Link to="/contact" className="text-base text-gray-300 hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><Link to="/about" className="text-base text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link to="/terms" className="text-base text-gray-300 hover:text-white">Terms of Use</Link></li>
                <li><Link to="/privacy" className="text-base text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/help" className="text-base text-gray-300 hover:text-white">Customer Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-base text-gray-400">
              © 2023 Rumos. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;