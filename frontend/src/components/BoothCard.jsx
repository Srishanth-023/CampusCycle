import React, { useState } from 'react';
import UnitCard from './UnitCard';
import { useBoothContext } from '../context/BoothContext';

const BoothCard = ({ booth }) => {
  const { getBoothUnits, isInBoothGeofence } = useBoothContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const boothUnits = getBoothUnits(booth._id);
  const isActive = isInBoothGeofence(booth._id);
  
  const freeUnits = boothUnits.filter(u => u.status === 'FREE').length;
  const occupiedUnits = boothUnits.filter(u => u.status === 'OCCUPIED').length;

  return (
    <div 
      className={`card transition-all duration-300 ${
        isActive ? 'geofence-active' : 'geofence-inactive'
      }`}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold">{booth.name}</h3>
            {isActive && (
              <span className="ml-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                IN RANGE
              </span>
            )}
            {!isActive && (
              <span className="ml-3 px-3 py-1 bg-gray-300 text-gray-600 text-xs font-bold rounded-full">
                OUT OF RANGE
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-lg mr-1">📍</span>
              <span>
                {booth.location.lat.toFixed(4)}, {booth.location.lon.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-1">⭕</span>
              <span>{booth.location.radius}m radius</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-3 flex items-center space-x-4">
            <div className="flex items-center">
              <span className="badge badge-free">{freeUnits} FREE</span>
            </div>
            <div className="flex items-center">
              <span className="badge badge-occupied">{occupiedUnits} OCCUPIED</span>
            </div>
            <div className="text-sm text-gray-500">
              Total: {boothUnits.length} units
            </div>
          </div>
        </div>

        {/* Expand/Collapse button */}
        <button 
          className="ml-4 text-3xl text-gray-400 hover:text-gray-600 transition-transform duration-300"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </button>
      </div>

      {/* Units Grid (Expandable) */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {boothUnits.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No units available in this booth
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boothUnits.map(unit => (
                <UnitCard 
                  key={unit._id} 
                  unit={unit} 
                  canInteract={isActive}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoothCard;
