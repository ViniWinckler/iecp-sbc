import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Eye, Star, User } from "lucide-react";

const sectionIcons = {
  about: Heart,
  vision: Eye,
  values: Star,
};

const sectionTitles = {
  about: "Nossa História",
  vision: "Nossa Visão",
  values: "Nossos Valores",
};

export default function AboutUs() {
  const [info, setInfo] = useState({});
  const [pastors, setPastors] = useState([]);

  useEffect(() => {
    base44.entities.ChurchInfo.list().then((items) => {
      const map = {};
      items.forEach((item) => { map[item.key] = item; });
      setInfo(map);
    }).catch(() => {});

    base44.entities.Pastor.list("order").then(setPastors).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-primary text-primary-foreground py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">
            Quem Somos
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold">Um lugar de recomeços e fé em São Bernardo.</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 space-y-20">
        {/* Info Sections */}
        {["about", "vision", "values"].map((key) => {
          const Icon = sectionIcons[key];
          const data = info[key];
          return (
            <section key={key} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-heading text-xl font-bold">{sectionTitles[key]}</h2>
                </div>
              </div>
              <div className="md:col-span-9">
                {data ? (
                  <>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {data.value}
                    </p>
                    {data.image_url && (
                      <img
                        src={data.image_url}
                        alt={sectionTitles[key]}
                        className="mt-6 rounded-lg w-full max-w-md object-cover aspect-video"
                      />
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground italic">Informação em breve...</p>
                )}
              </div>
            </section>
          );
        })}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Pastors Section */}
        <section>
          <div className="mb-10">
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">
              Liderança
            </p>
            <h2 className="font-heading text-3xl font-bold">Nossa Equipe Pastoral</h2>
          </div>

          {pastors.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-lg p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground text-sm italic">Cadastre os pastores no painel</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastors.map((pastor) => (
                <div
                  key={pastor.id}
                  className="border border-border rounded-lg p-6 text-center hover:border-accent/30 transition-colors"
                >
                  {pastor.photo_url ? (
                    <img
                      src={pastor.photo_url}
                      alt={pastor.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4">
                      <span className="font-heading text-2xl font-bold text-primary">
                        {pastor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="font-heading text-lg font-bold">{pastor.name}</h3>
                  <p className="text-accent text-sm font-medium mt-1">{pastor.role || "Pastor"}</p>
                  {pastor.bio && (
                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{pastor.bio}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}