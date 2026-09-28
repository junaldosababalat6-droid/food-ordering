import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { TrendingUp, Tag, Star, Clock } from "lucide-react";
import { getLocalizedMenuField } from "../utils/menuLocalization";

const getSlideInfo = (item, idx, t) => {
  const badges = [
    { label: t.bestSeller, icon: TrendingUp, color: "#f97316" },
    { label: t.specialDiscount, icon: Tag, color: "#ef4444" },
    { label: t.chefPick, icon: Star, color: "#f59e0b" },
  ];
  const badge = badges[idx % badges.length];
  return { ...item, badge, icon: badge.icon, color: badge.color };
};

export const BannerSlider = () => {
  const { menuItems, language, t } = useApp();
  const [current, setCurrent] = useState(0);

  const featuredItems = menuItems
    .filter((item) => item.available)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const slides = featuredItems.map((item, idx) => ({
    ...getSlideInfo(item, idx, t),
  }));

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="banner-slider">
        <div className="banner-slide-bg" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80")` }}>
          <div className="banner-slide-overlay" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.7), rgba(234,88,12,0.6))" }} />
        </div>
        <div className="banner-slide-content">
          <p style={{ fontSize: "1.2rem" }}>{t.noFeaturedItems}</p>
        </div>
      </div>
    );
  }

  const Slide = slides[current];
  const Icon = Slide.icon;

  const goToSlide = (index) => setCurrent(index);
  const goToPrev = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToNext = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <div className="banner-slider">
      <div
        className="banner-slide-bg"
        style={{ backgroundImage: `url(${Slide.image})` }}
      >
        <div
          className="banner-slide-overlay"
          style={{ background: `linear-gradient(135deg, ${Slide.color}cc, ${Slide.color}77)` }}
        />
      </div>

      <div className="banner-slide-content">
        <div className="banner-slide-badge" style={{ background: `${Slide.color}33`, color: Slide.color, border: `1px solid ${Slide.color}66` }}>
          <Icon size={16} />
          <span>{Slide.badge.label}</span>
        </div>
        <h2 className="banner-slide-title">{getLocalizedMenuField(Slide, "name", language)}</h2>
        <p className="banner-slide-desc">{getLocalizedMenuField(Slide, "description", language)}</p>
      </div>

      <div className="banner-slider-controls">
        <button className="banner-nav-btn" onClick={goToPrev}>
          ‹
        </button>
        <div className="banner-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`banner-dot ${idx === current ? "active" : ""}`}
              onClick={() => goToSlide(idx)}
              style={idx === current ? { background: Slide.color } : {}}
            />
          ))}
        </div>
        <button className="banner-nav-btn" onClick={goToNext}>
          ›
        </button>
      </div>

      <div className="banner-progress">
        <div
          className="banner-progress-bar"
          style={{
            width: `${((current + 1) / slides.length) * 100}%`,
            background: Slide.color,
          }}
        />
      </div>
    </div>
  );
};
