import React, { useState } from 'react';
import { useBoothContext } from '../context/BoothContext';

const UnitCard = ({ unit, canInteract }) => {
  const { parkCycle, takeCycle } = useBoothContext();
  const [rfid, setRfid] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showInput, setShowInput] = useState(false);

  const isFree = unit.status === 'FREE';

  const handlePark = async () => {
    if (!rfid.trim()) {
      setMessage({ type: 'error', text: 'Please enter RFID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await parkCycle(unit.unitId, rfid.trim());
      setMessage({ type: 'success', text: 'Cycle parked successfully!' });
      setRfid('');
      setShowInput(false);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to park cycle' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTake = async () => {
    if (!rfid.trim()) {
      setMessage({ type: 'error', text: 'Please enter RFID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await takeCycle(unit.unitId, rfid.trim());
      setMessage({ type: 'success', text: 'Cycle taken successfully!' });
      setRfid('');
      setShowInput(false);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to take cycle' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card ${!canInteract ? 'opacity-50' : ''}`}>
      {/* Unit Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-lg">{unit.unitId}</h4>
        <span className={`badge ${isFree ? 'badge-free' : 'badge-occupied'}`}>
          {unit.status}
        </span>
      </div>

      {/* Cycle RFID (if occupied) */}
      {!isFree && unit.cycleRfid && (
        <div className="mb-3 p-2 bg-gray-100 rounded">
          <p className="text-xs text-gray-600">Cycle RFID:</p>
          <p className="font-mono font-semibold text-sm">{unit.cycleRfid}</p>
        </div>
      )}

      {/* Action Buttons */}
      {!canInteract ? (
        <div className="text-center py-3 text-sm text-gray-500">
          🔒 Move into geofence to interact
        </div>
      ) : (
        <div>
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className={`w-full ${
                isFree 
                  ? 'btn btn-success' 
                  : 'btn btn-danger'
              }`}
            >
              {isFree ? '🅿️ Park Cycle' : '🚴 Take Cycle'}
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter RFID..."
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                className="input text-sm"
                disabled={loading}
                autoFocus
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={isFree ? handlePark : handleTake}
                  disabled={loading || !rfid.trim()}
                  className={`flex-1 btn ${
                    loading || !rfid.trim()
                      ? 'btn-disabled'
                      : isFree 
                        ? 'btn-success' 
                        : 'btn-danger'
                  }`}
                >
                  {loading ? '⏳ Processing...' : isFree ? '✓ Park' : '✓ Take'}
                </button>
                
                <button
                  onClick={() => {
                    setShowInput(false);
                    setRfid('');
                    setMessage(null);
                  }}
                  disabled={loading}
                  className="btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mt-2 p-2 rounded text-sm ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      )}

      {/* Last Update Indicator */}
      <div className="mt-3 text-xs text-gray-400 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 pulse-soft"></span>
        Real-time sync
      </div>
    </div>
  );
};

export default UnitCard;
