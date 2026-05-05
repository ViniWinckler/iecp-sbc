import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function Location() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    base44.entities.ChurchInfo.list().then((items) => {
      const map = {};
      items.forEach((item) => { map[item.key] = item; });
      setInfo(map);
    }).catch(() => {});
  }, []);

  const lat = info.latitude ? parseFloat(info.latitude.value) : -23.5505;
  const lng = info.longitude ? parseFloat(info.longitude.value) : -46.6333;
  const address = info.address?.value || "Endereço não configurado";

  const handleDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1600&h=600&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">Localização</h1>
            <p className="text-white/70 text-lg">Saiba como chegar até nós</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-border h-[400px] lg:h-[500px]">
            <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]}>
                <Popup>Nossa Igreja</Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Endereço</h3>
              <p className="text-muted-foreground leading-relaxed">{address}</p>
            </div>

            <Button
              onClick={handleDirections}
              className="w-full bg-primary hover:bg-primary/90 gap-2 h-12"
              size="lg"
            >
              <Navigation className="w-5 h-5" />
              Como Chegar
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}