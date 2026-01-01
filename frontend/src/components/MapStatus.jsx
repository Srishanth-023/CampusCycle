import React from 'react';
import { useBoothContext } from '../context/BoothContext';

const MapStatus = () => {
  const { 
    userLocation, 
    activeBoothId, 
    booths, 
    geolocationSupported, 
    updateUserLocation 
  } = useBoothContext();

  const activeBooth = booths.find(b => b._id === activeBoothId);

  return (
    <div className="card mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">📍 Your Location Status</h2>
          
          {!geolocationSupported ? (
            <div className="bg-red-500 bg-opacity-20 border border-red-300 rounded-lg p-3">
              <p className="font-semibold">❌ Geolocation not supported</p>
              <p className="text-sm">Your browser doesn't support geolocation</p>
            </div>
          ) : !userLocation ? (
            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3">
              <p className="font-semibold">⏳ Getting your location...</p>
              <p className="text-sm">Please allow location access</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-sm opacity-90">Coordinates:</p>
                <p className="font-mono text-sm">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </p>
              </div>

              {activeBooth ? (
                <div className="bg-green-500 bg-opacity-30 border-2 border-green-300 rounded-lg p-3">
                  <p className="font-semibold flex items-center">
                    <span className="text-2xl mr-2">✅</span>
                    Inside Geofence
                  </p>
                  <p className="text-lg font-bold mt-1">{activeBooth.name}</p>
                  <p className="text-sm opacity-90 mt-1">
                    You can interact with this booth's units
                  </p>
                </div>
              ) : (
                <div className="bg-red-500 bg-opacity-30 border-2 border-red-300 rounded-lg p-3">
                  <p className="font-semibold flex items-center">
                    <span className="text-2xl mr-2">❌</span>
                    Outside All Geofences
                  </p>
                  <p className="text-sm opacity-90 mt-1">
                    Move closer to a booth to interact with it
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-4">
          <button
            onClick={updateUserLocation}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all active:scale-95"
            title="Refresh location"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Live indicator */}
      <div className="mt-4 flex items-center text-sm opacity-90">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
        Live tracking active (updates every 10s)
      </div>
    </div>
  );
};

export default MapStatus;
