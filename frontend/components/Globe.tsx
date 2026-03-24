"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, Objects } from "topojson-specification";

const CARIBBEAN_MARKERS = [
  { name: "Jamaica", lat: 18.1, lng: -77.3 },
  { name: "Trinidad", lat: 10.7, lng: -61.5 },
  { name: "Barbados", lat: 13.2, lng: -59.6 },
  { name: "Saint Lucia", lat: 13.9, lng: -60.9 },
  { name: "Guyana", lat: 4.9, lng: -59.0 },
  { name: "Bahamas", lat: 25.0, lng: -77.3 },
  { name: "Cuba", lat: 22.0, lng: -79.0 },
  { name: "Puerto Rico", lat: 18.2, lng: -66.6 },
  { name: "Antigua", lat: 17.1, lng: -61.8 },
  { name: "Grenada", lat: 12.1, lng: -61.7 },
  { name: "Haiti", lat: 18.9, lng: -72.3 },
  { name: "Dominican Republic", lat: 18.7, lng: -70.2 },
  { name: "Martinique", lat: 14.7, lng: -61.0 },
  { name: "Guadeloupe", lat: 16.3, lng: -61.6 },
  { name: "Belize", lat: 17.2, lng: -88.5 },
  { name: "Suriname", lat: 3.9, lng: -56.0 },
  { name: "Sint Maarten", lat: 18.0, lng: -63.1 },
  { name: "Cayman Islands", lat: 19.3, lng: -81.4 },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

type Region = "caribbean" | "americas" | "europe" | "other";

function classifyPoint(lat: number, lng: number): Region {
  // Caribbean basin
  if (lat >= 7 && lat <= 29 && lng >= -92 && lng <= -56) return "caribbean";
  // North + South America
  if (lng >= -170 && lng <= -30) return "americas";
  // Europe
  if (lat >= 34 && lat <= 72 && lng >= -12 && lng <= 45) return "europe";
  return "other";
}

const REGION_OPACITY: Record<Region, number> = {
  caribbean: 0.82,
  americas: 0.44,
  europe: 0.2,
  other: 0.1,
};

const REGION_COLOR: Record<Region, number> = {
  caribbean: 0x00c4ff,
  americas: 0x007bff,
  europe: 0x0055cc,
  other: 0x003a8c,
};

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const { clientWidth: w, clientHeight: h } = container;

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0.3, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const R = 1;

    // Single group so everything rotates together
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Core sphere
    const globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(R, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x060810,
        emissive: 0x001133,
        specular: 0x0066cc,
        shininess: 90,
      })
    );
    globeGroup.add(globeMesh);

    // Lat/lng wireframe
    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R + 0.002, 24, 24),
        new THREE.MeshBasicMaterial({
          color: 0x007bff,
          wireframe: true,
          transparent: true,
          opacity: 0.06,
        })
      )
    );

    // Atmosphere glow layers (stay at scene level so they don't rotate off-axis)
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.07, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0x007bff,
          transparent: true,
          opacity: 0.05,
          side: THREE.BackSide,
        })
      )
    );
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R * 1.18, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0x003399,
          transparent: true,
          opacity: 0.025,
          side: THREE.BackSide,
        })
      )
    );

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const blueLight = new THREE.PointLight(0x007bff, 3.5, 8);
    blueLight.position.set(2, 1, 2);
    scene.add(blueLight);
    const rimLight = new THREE.PointLight(0x003399, 1.5, 8);
    rimLight.position.set(-2, -0.5, -1.5);
    scene.add(rimLight);

    // ── Landmasses ──────────────────────────────────────────────────────────────
    const landR = R + 0.004; // slightly above sphere surface

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const topo = require("world-atlas/countries-110m.json") as Topology<Objects>;
    // feature() returns FeatureCollection — cast to access coordinates
    const countries = feature(topo, topo.objects.countries) as {
      features: Array<{
        geometry: {
          type: string;
          coordinates: unknown;
        } | null;
      }>;
    };

    const landGroup = new THREE.Group();

    for (const f of countries.features) {
      if (!f.geometry) continue;

      const type = f.geometry.type;
      // Collect all polygon rings regardless of Polygon vs MultiPolygon
      const allRings: number[][][] = [];

      if (type === "Polygon") {
        const coords = (f.geometry as { coordinates: number[][][] }).coordinates;
        allRings.push(...coords);
      } else if (type === "MultiPolygon") {
        const coords = (
          f.geometry as { coordinates: number[][][][] }
        ).coordinates;
        for (const poly of coords) allRings.push(...poly);
      }

      for (const ring of allRings) {
        if (ring.length < 2) continue;

        // Classify by first vertex
        const [firstLng, firstLat] = ring[0];
        const region = classifyPoint(firstLat, firstLng);
        const opacity = REGION_OPACITY[region];
        const color = REGION_COLOR[region];

        const mat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
        });

        // Split at anti-meridian crossings (|Δlng| > 180)
        const batches: THREE.Vector3[][] = [];
        let batch: THREE.Vector3[] = [];
        let prevLng: number | null = null;

        for (const [lng, lat] of ring) {
          if (prevLng !== null && Math.abs(lng - prevLng) > 180) {
            if (batch.length > 1) batches.push(batch);
            batch = [];
          }
          batch.push(latLngToVector3(lat, lng, landR));
          prevLng = lng;
        }
        if (batch.length > 1) batches.push(batch);

        for (const pts of batches) {
          landGroup.add(
            new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat)
          );
        }
      }
    }

    globeGroup.add(landGroup);

    // ── Caribbean island markers ─────────────────────────────────────────────
    const markerGroup = new THREE.Group();
    CARIBBEAN_MARKERS.forEach(({ lat, lng }) => {
      const pos = latLngToVector3(lat, lng, R + 0.013);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x00c4ff })
      );
      dot.position.copy(pos);
      markerGroup.add(dot);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 10, 10),
        new THREE.MeshBasicMaterial({
          color: 0x00c4ff,
          transparent: true,
          opacity: 0.28,
        })
      );
      glow.position.copy(pos);
      markerGroup.add(glow);
    });
    globeGroup.add(markerGroup);

    // Initial rotation so Caribbean faces the camera
    const initialY = 0.4;
    globeGroup.rotation.y = initialY;

    // ── Interaction ──────────────────────────────────────────────────────────
    let autoY = initialY;
    let targetY = initialY;
    let isDragging = false;
    let lastX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      targetY += (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      lastX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      targetY += (e.touches[0].clientX - lastX) * 0.005;
      lastX = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Pulse glow rings
      markerGroup.children.forEach((child, i) => {
        if (i % 2 === 1) {
          const mat = (child as THREE.Mesh)
            .material as THREE.MeshBasicMaterial;
          mat.opacity = 0.16 + 0.16 * Math.sin(t * 2.2 + i * 0.8);
        }
      });

      if (!isDragging) {
        autoY += 0.0011;
        targetY = autoY;
      } else {
        autoY = targetY;
      }

      globeGroup.rotation.y += (targetY - globeGroup.rotation.y) * 0.07;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
}
