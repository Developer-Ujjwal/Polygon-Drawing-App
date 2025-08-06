"use client";

import type React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { DrawingCanvas } from "./drawing-canvas";
import { Sidebar } from "./sidebar";
import type { Point, Polygon, AppState, ImageData } from "../types/polygon";
import { isNearPoint } from "../utils/canvas";
import { saveToLocalStorage, loadFromLocalStorage } from "../utils/storage";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function PolygonDrawingApp() {
  const [appState, setAppState] = useState<AppState>({
    polygons: [],
    activePolygon: null,
    selectedPolygonId: null,
    backgroundImage: null,
  });
  const [folderName, setFolderName] = useState("");

  const [currentLabel, setCurrentLabel] = useState("");
  const [history, setHistory] = useState<AppState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const savedData = loadFromLocalStorage();
    const initialState: AppState = {
      polygons: savedData.polygons,
      activePolygon: null,
      selectedPolygonId: null,
      backgroundImage: savedData.backgroundImage,
    };

    setAppState(initialState);
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  useEffect(() => {
    if (historyIndex >= 0) {
      saveToLocalStorage(appState.polygons, appState.backgroundImage);
    }
  }, [appState.polygons, appState.backgroundImage, historyIndex]);

  const saveToHistory = useCallback(
    (newState: AppState) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({ ...newState });
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
      setAppState(newState);
    },
    [historyIndex]
  );

  const handleCanvasClick = useCallback(
    (point: Point) => {
      const newState = { ...appState };

      if (!newState.activePolygon) {
        const newPolygon: Polygon = {
          id: Date.now().toString(),
          points: [point],
          label: "",
          completed: false,
          color: COLORS[newState.polygons.length % COLORS.length],
        };
        newState.activePolygon = newPolygon;
        newState.selectedPolygonId = null;
      } else {
        const activePolygon = { ...newState.activePolygon };

        if (
          activePolygon.points.length >= 3 &&
          isNearPoint(point, activePolygon.points[0], 15)
        ) {
          activePolygon.completed = true;
          activePolygon.label =
            currentLabel || `Polygon ${newState.polygons.length + 1}`;
          newState.polygons = [...newState.polygons, activePolygon];
          setCurrentLabel("");
        } else {
          activePolygon.points = [...activePolygon.points, point];
          newState.activePolygon = activePolygon;
        }
      }

      saveToHistory(newState);
    },
    [appState, currentLabel, saveToHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAppState(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAppState(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleSavePolygon = useCallback(() => {
    if (!appState.activePolygon || appState.activePolygon.points.length < 3)
      return;

    const newState = { ...appState };
    const activePolygon = { ...newState.activePolygon };
    activePolygon.completed = true;
    activePolygon.label =
      currentLabel || `Polygon ${newState.polygons.length + 1}`;

    newState.polygons = [
      ...newState.polygons.filter((p) => p.id !== activePolygon.id),
      activePolygon,
    ];
    newState.activePolygon = null;
    setCurrentLabel("");

    saveToHistory(newState);
  }, [appState, currentLabel, saveToHistory]);

  const handleClearCanvas = useCallback(() => {
    const newState: AppState = {
      polygons: [],
      activePolygon: null,
      selectedPolygonId: null,
      backgroundImage: appState.backgroundImage,
    };
    setCurrentLabel("");
    saveToHistory(newState);
  }, [appState.backgroundImage, saveToHistory]);

  const handleSelectPolygon = useCallback((id: string | null) => {
    setAppState((prev) => ({ ...prev, selectedPolygonId: id }));
  }, []);

  const handleDeletePolygon = useCallback(
    (id: string) => {
      const newState = {
        ...appState,
        polygons: appState.polygons.filter((p) => p.id !== id),
        selectedPolygonId:
          appState.selectedPolygonId === id ? null : appState.selectedPolygonId,
      };
      saveToHistory(newState);
    },
    [appState, saveToHistory]
  );

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const imageData: ImageData = {
            id: Date.now().toString(),
            src: e.target?.result as string,
            width: img.width,
            height: img.height,
            name: file.name,
          };

          const newState = {
            ...appState,
            backgroundImage: imageData,
            polygons: [],
            activePolygon: null,
            selectedPolygonId: null,
          };

          saveToHistory(newState);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      event.target.value = "";
    },
    [appState, saveToHistory]
  );

  const handleRemoveImage = useCallback(() => {
    const newState = {
      ...appState,
      backgroundImage: null,
    };
    saveToHistory(newState);
  }, [appState, saveToHistory]);

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;

    exportCtx.drawImage(canvas, 0, 0);

    exportCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folderName}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleSaveToFile = () => {
    const dataStr = JSON.stringify(
      {
        polygons: appState.polygons,
        backgroundImage: appState.backgroundImage,
      },
      null,
      2
    );
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${folderName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadFromFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const newState: AppState = {
            polygons: data.polygons || [],
            activePolygon: null,
            selectedPolygonId: null,
            backgroundImage: data.backgroundImage || null,
          };
          saveToHistory(newState);
        } catch (error) {
          alert("Error loading file. Please make sure it's a valid JSON file.");
        }
      };
      reader.readAsText(file);

      event.target.value = "";
    },
    [saveToHistory]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Polygon Annotation App
          </h1>
          <div className="text-sm text-gray-500">
            {appState.backgroundImage
              ? "Click to place points on image • Click near start point to close polygon"
              : "Upload an image or click to place points • Click near start point to close polygon"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 p-4">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
            <DrawingCanvas
              ref={canvasRef}
              polygons={appState.polygons}
              activePolygon={appState.activePolygon}
              backgroundImage={appState.backgroundImage}
              onCanvasClick={handleCanvasClick}
              selectedPolygonId={appState.selectedPolygonId}
            />
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          folderName={folderName}
          setFolderName={setFolderName}
          polygons={appState.polygons}
          activePolygon={appState.activePolygon}
          backgroundImage={appState.backgroundImage}
          selectedPolygonId={appState.selectedPolygonId}
          currentLabel={currentLabel}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onLabelChange={setCurrentLabel}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSavePolygon={handleSavePolygon}
          onClearCanvas={handleClearCanvas}
          onSelectPolygon={handleSelectPolygon}
          onDeletePolygon={handleDeletePolygon}
          onSaveToFile={handleSaveToFile}
          onLoadFromFile={handleLoadFromFile}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onExportImage={handleExportImage}
        />
      </div>
    </div>
  );
}
