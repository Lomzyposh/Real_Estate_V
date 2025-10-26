import React, { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function MapView({
  properties = [],
  center = [6.5244, 3.3792],
  zoom = 12,
  zoomThreshold = 14,
  dark = false,
}) {
  const { theme, isDarkMode } = useTheme();
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.L) return;
    const L = window.L;

    const map = L.map("map", { zoomControl: true }).setView(center, zoom);
    mapRef.current = map;

    L.tileLayer(`${isDarkMode ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}`, {
      maxZoom: 18,
    }).addTo(map);

    const goToDetails = (id) => navigate(`/details/${id}`);

    const circleIcon = (active = false) =>
      L.divIcon({
        className: "",
        html: `
      <div class="flex items-center justify-center 
                  w-7 h-7 rounded-full 
                  shadow-md ring-[3px] ring-black/10 
                  ${active ? "bg-orange-500" : "bg-gray-700 dark:bg-slate-300"}
                  transition-transform duration-200 hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 512 512" 
             class="w-3.5 h-3.5 text-white dark:text-orange-600 fill-current">
          <path d="M256 32 32 240h64v240h128V352h64v128h128V240h64z"/>
        </svg>
      </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });


    const priceBadgeHtml = (price) => {
      const base = [
        "relative inline-flex items-center justify-center font-semibold text-[13px] font-[inter]",
        "min-w-[56px] h-[30px] px-2.5 rounded-full border shadow-lg",
        "-translate-y-0.5 select-none pointer-events-none",
        "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-2",
        "after:border-l-[7px] after:border-r-[7px] after:border-l-transparent after:border-r-transparent",
        "after:border-t-[8px] after:drop-shadow",
      ];
      const light = [
        "text-emerald-950 border-emerald-500/55",
        "bg-gradient-to-b from-emerald-200 to-emerald-300",
        "shadow-[0_6px_10px_rgba(16,185,129,0.25)]",
        "after:border-t-emerald-300",
      ];
      const darkArr = [
        "text-emerald-50 border-emerald-500/65",
        "bg-gradient-to-b from-emerald-900 to-emerald-800",
        "shadow-[0_6px_10px_rgba(16,185,129,0.25)]",
        "after:border-t-emerald-800",
      ];
      return `<div class="${[...base, ...(dark ? darkArr : light)].join(" ")}">$${Intl.NumberFormat().format(
        price ?? 0
      )}</div>`;
    };

    const popupHtml = (p) => {
      const img = p.main_image || p.images?.[0]?.url;
      const addr = p.street || p.address || "";
      return `
        <div class="w-64 p-2 rounded-xl bg-zinc-900/90 text-zinc-100 border border-zinc-700 shadow-lg pointer-events-auto">
        <button id="popup-close-btn" class="absolute top-2 right-2 text-sm font-bold bg-emerald-600 text-white rounded-full w-5 h-5 cursor-pointer">&times;</button>
          <div class="overflow-hidden rounded-lg mb-2">
            ${img
          ? `<img src="${img}" alt="${p.title || ""}" class="w-full h-28 object-cover" />`
          : `<div class="w-full h-28 bg-zinc-800 grid place-items-center text-xs text-zinc-400">No image</div>`
        }
          </div>
          <div class="space-y-1">
            <div class="text-sm font-semibold">${p.title || p.property_type || "Property"}</div>
            <div class="text-xs text-zinc-300">${addr}</div>
            <div class="text-sm font-semibold text-emerald-400">$${Intl.NumberFormat().format(
          p.price || 0
        )}</div>
          </div>
          <div class="mt-2 flex gap-2">
            <button class="px-3 py-1.5 rounded-md bg-emerald-500 text-white text-xs">View</button>
            <button class="px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">Save</button>
          </div>
        </div>
      `;
    };

    properties.forEach((p) => {
      const lat = p.latitude ?? p.lat;
      const lng = p.longitude ?? p.lng;
      if (lat == null || lng == null) return;

      const marker = L.marker([lat, lng], {
        icon: circleIcon(false),
        riseOnHover: true,
      }).addTo(map);

      const badgePopup = L.popup({
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: "tw-price-badge",
        offset: [0, -1],
        autoPan: false,
      }).setLatLng([lat, lng]);

      badgePopup.setContent(priceBadgeHtml(p.price ?? 0));

      // clicking the marker opens the interactive detail box
      marker.on("click", () => {
        // hide this marker's badge while detail is open (to avoid overlap)
        if (map.hasLayer(badgePopup)) map.closePopup(badgePopup);

        const detailPopup = L.popup({
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          keepInView: true,
          offset: [0, -20],
          className: "tw-detail-popup",
        })
          .setLatLng([lat, lng])
          .setContent(popupHtml(p))
          .openOn(map);

        setTimeout(() => {
          const closeBtn = document.getElementById("popup-close-btn");
          if (closeBtn) {
            closeBtn.addEventListener("click", () => {
              map.closePopup(detailPopup);
              const z = map.getZoom();
              if (z >= zoomThreshold) {
                const { badgePopup } = markersRef.current.get(p.property_id ?? p.id);
                if (badgePopup) badgePopup.openOn(map);
              }
            });
          }
        }, 0);

        markersRef.current.get(p.property_id ?? p.id).detailPopup = detailPopup;
      });

      marker
        .on("mouseover", () => marker.setZIndexOffset(1000))
        .on("mouseout", () => marker.setZIndexOffset(0));

      markersRef.current.set(p.property_id ?? p.id, {
        marker,
        price: p.price ?? 0,
        badgePopup,
      });
    });

    const updateBadgesForZoom = () => {
      const z = map.getZoom();
      if (z >= zoomThreshold) {
        markersRef.current.forEach(({ badgePopup }) => {
          if (!map.hasLayer(badgePopup)) badgePopup.openOn(map);
        });
      } else {
        // hide all badges; leave any detail popups alone
        markersRef.current.forEach(({ badgePopup }) => {
          if (map.hasLayer(badgePopup)) map.closePopup(badgePopup);
        });
      }
    };

    const repaintDots = () => {
      markersRef.current.forEach(({ marker }) => {
        const html = marker.getIcon()?.options?.html || "";
        const isActive = html.includes("bg-orange-500");
        marker.setIcon(circleIcon(isActive));
      });
    };

    // when zoom changes, toggle badges
    map.on("zoomend", () => {
      updateBadgesForZoom();
      repaintDots();
    });

    // initial fit + show/hide badges
    if (properties.length) {
      const bounds = L.latLngBounds(
        properties
          .filter((p) => (p.latitude ?? p.lat) != null && (p.longitude ?? p.lng) != null)
          .map((p) => [p.latitude ?? p.lat, p.longitude ?? p.lng])
      );
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
    }
    updateBadgesForZoom();

    return () => {
      map.off("zoomend");
      // clean up popups + markers
      markersRef.current.forEach(({ marker, badgePopup, detailPopup }) => {
        if (badgePopup) map.closePopup(badgePopup);
        if (detailPopup) map.closePopup(detailPopup);
        marker.remove();
      });
      markersRef.current.clear();
      map.remove();
    };
  }, [properties, center, zoom, zoomThreshold, dark]);

  return (
    <div
      id="map"
      className="w-full h-full absolute rounded-2xl border z-10 border-zinc-200 dark:border-zinc-700 shadow"
    />
  );
}
