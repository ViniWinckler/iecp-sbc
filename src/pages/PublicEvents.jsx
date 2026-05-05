import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Event.filter({ is_public: true }, "-date")
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=600&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">Eventos</h1>
            <p className="text-white/70 text-lg">Próximos eventos abertos ao público</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Nenhum evento público no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {event.image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-accent/40" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4" />
                    {moment(event.date).format("DD [de] MMM [de] YYYY [às] HH:mm")}
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-muted-foreground text-sm line-clamp-3">{event.description}</p>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}