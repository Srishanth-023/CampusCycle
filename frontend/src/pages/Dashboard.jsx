import React, { useState } from 'react';
import { useBoothContext } from '../context/BoothContext';
import BoothCard from '../components/BoothCard';
import MapStatus from '../components/MapStatus';

const Dashboard = () => {
  const { booths, loading, error } = useBoothContext();
  const [filter, setFilter] = useState('all'); // all, in-range, out-of-range

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Campus Cycle System...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md bg-red-50 border-2 border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-2">⚠️ Error</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn btn-danger w-full"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <span className="text-4xl mr-3">🚴</span>
                Campus Cycle Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time cycle tracking with geofencing
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Location Status */}
        <MapStatus />

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cycle Booths</h2>
            <p className="text-gray-600">
              {booths.length} booth{booths.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Booths
            </button>
            <button
              onClick={() => setFilter('in-range')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'in-range'
                  ? 'bg-success text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              In Range
            </button>
            <button
              onClick={() => setFilter('out-of-range')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'out-of-range'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Out of Range
            </button>
          </div>
        </div>

        {/* Booths List */}
        <div className="space-y-4">
          {booths.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-xl text-gray-500">No booths available</p>
              <p className="text-sm text-gray-400 mt-2">
                Please contact your administrator to add booths
              </p>
            </div>
          ) : (
            booths.map(booth => (
              <BoothCard key={booth._id} booth={booth} />
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📖 How to Use</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>1. <strong>Allow location access</strong> when prompted by your browser</p>
            <p>2. <strong>Move within 100m</strong> of a booth to activate it</p>
            <p>3. <strong>Expand a booth</strong> to see available units</p>
            <p>4. <strong>Park a cycle:</strong> Select a FREE unit and enter the RFID</p>
            <p>5. <strong>Take a cycle:</strong> Select an OCCUPIED unit and enter matching RFID</p>
            <p>6. <strong>Live updates:</strong> All changes sync instantly across devices</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Built with ❤️ using MERN Stack + Socket.IO</p>
          <p className="mt-1">Real-time geofencing • Live sync • RFID validation</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
