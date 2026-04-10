import { useState } from "react";
import CarouselStack from "../components/CarouselStack";
import { SettingsPanel, AnimationSettings } from "../components/SettingsPanel";

export default function HomePage() {
  const [settings, setSettings] = useState<AnimationSettings>({
    springDuration: 0.3,
    springBounce: 0.3,
    xSpringDuration: 0.5,
    xSpringBounce: 0.1,
    dragElastic: 0.7,
    swipeConfidenceThreshold: 10000,
    zIndexDelay: 0.05,
  });

  return (
    <div className="App" style={{ background: '#ffffff', minHeight: '100vh', width: '100vw' }}>
      <style>{`
        :root, html, body, html.dark, html.dark body, .dark { 
           background-color: #ffffff !important; 
           color-scheme: light !important;
        }
      `}</style>
      <div className="hero-container">
        <div className="container" style={{ position: 'relative' }}>
          <CarouselStack settings={settings} />
        </div>
      </div>
      <SettingsPanel 
        settings={settings} 
        onSettingsChange={setSettings} 
      />
    </div>
  );
}
