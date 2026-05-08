import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Maps = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('https://orix.mukhriddin.uz/api/offices/');

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();

        // API massiv qaytarayotgani uchun to'g'ridan-to'g'ri ishlatamiz
        const officesList = Array.isArray(data) ? data : data?.data || [];
        
        setOffices(officesList);
        
      } catch (err) {
        console.error("Ofis API xatosi:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, []);

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto w-full h-[400px] mt-16 rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-100 flex items-center justify-center">
        <p className="text-[#274F94] font-medium">Ofislar yuklanmoqda...</p>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error || offices.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto w-full h-[300px] mt-16 rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-100 flex items-center justify-center flex-col">
        <p className="text-red-600 font-medium">Ofislar topilmadi</p>
        {error && <p className="text-sm text-gray-500 mt-2">{error}</p>}
        <p className="text-xs text-gray-400 mt-4">API: https://orix.mukhriddin.uz/api/offices/</p>
      </div>
    );
  }

  const center = [
    parseFloat(offices[0].latitude),
    parseFloat(offices[0].longitude)
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 mt-16">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-[#274F94]">Bizning Ofislarimiz</h3>
      </div>

      {/* Xarita */}
      <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-10">
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {offices.map((office) => (
            <Marker
              key={office.id}
              position={[parseFloat(office.latitude), parseFloat(office.longitude)]}
            >
              <Popup>
                <b>{office.name}</b><br />
                {office.address}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Ofislar ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offices.map((office) => (
          <div key={office.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-xl text-[#274F94]">{office.name}</h4>
            <p className="text-[#274F94] mt-2">{office.address}</p>
            
            <a
              href={`https://www.google.com/maps?q=${office.latitude},${office.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#8F0810] text-sm font-medium mt-4 inline-block hover:underline"
            >
              📍 Xaritada ochish
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Maps;