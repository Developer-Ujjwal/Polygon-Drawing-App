"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Download, Upload, Undo, Redo, Save } from "lucide-react";
import type { Polygon } from "../types/polygon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarProps {
  folderName: string;
  setFolderName: (name: string) => void;
  polygons: Polygon[];
  activePolygon: Polygon | null;
  backgroundImage: ImageData | null;
  selectedPolygonId: string | null;
  currentLabel: string;
  canUndo: boolean;
  canRedo: boolean;
  onLabelChange: (label: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSavePolygon: () => void;
  onClearCanvas: () => void;
  onSelectPolygon: (id: string | null) => void;
  onDeletePolygon: (id: string) => void;
  onSaveToFile: () => void;
  onLoadFromFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onExportImage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folderName,
  setFolderName,
  polygons,
  activePolygon,
  backgroundImage,
  selectedPolygonId,
  currentLabel,
  canUndo,
  canRedo,
  onLabelChange,
  onUndo,
  onRedo,
  onSavePolygon,
  onClearCanvas,
  onSelectPolygon,
  onDeletePolygon,
  onSaveToFile,
  onLoadFromFile,
  onImageUpload,
  onRemoveImage,
  onExportImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const defaultLabels = [
    "Smokeless tobacco keratosis",
    "Homogeneous oral leukoplakia",
    "Oral lichen planus",
    "Speckled oral leukoplakia",
    "Erythroplakia",
    "Verrucous oral leukoplakia",
    "Proliferative verrucous leukoplakia",
    "Squamous cell carcinoma of oral mucous membrane",
    "Benign",
  ];
  
const [isSaving, setIsSaving] = React.useState(false);

const handleSaveAll = async () => {
  if (folderName.trim()) {
    setIsSaving(true);
    try {
      await onSaveToFile();
      await onExportImage();
    } finally {
      setIsSaving(false);
    }
  }
};

const [labels, setLabels] = React.useState<string[]>(defaultLabels);
const [draftLabel, setDraftLabel] = React.useState(currentLabel || '');

const handleSaveLabel = () => {
  if (draftLabel.trim()) {
    onLabelChange(draftLabel);
    if (!labels.includes(draftLabel)) {
      setLabels(prev => {
        const updated = [...prev, draftLabel];
        localStorage.setItem('labels', JSON.stringify(updated));
        return updated;
      });
    }
  }
};

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <div className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Export</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <Input
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        placeholder="Enter File name"
      />
      <Button
        onClick={handleSaveAll}
        className="w-full"
        disabled={!folderName.trim() || isSaving}
      >
        <Download className="w-4 h-4 mr-2" />
        Save
      </Button>
    </CardContent>
  </Card>
        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
              >
                <Undo className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button
                onClick={onRedo}
                disabled={!canRedo}
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
              >
                <Redo className="w-4 h-4 mr-1" />
                Redo
              </Button>
            </div>

            <Button
              onClick={onClearCanvas}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Canvas
            </Button>

            <Separator />

            <div className="flex gap-2">
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={onLoadFromFile}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Image Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Background Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!backgroundImage ? (
              <div>
                <Button
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <br />
                  {backgroundImage.width} × {backgroundImage.height}
                </div>
                <div className="flex gap-2">
                  
                  <Button
                onClick={onRemoveImage}
                variant="destructive"
                size="sm"
                className="flex-1"
                disabled={!backgroundImage}
              >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Drawing */}
        {activePolygon && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Polygon Labeling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="polygon-label">Label</Label>
                <Select onValueChange={onLabelChange} value={currentLabel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select or enter label..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Predefined Labels</SelectLabel>
                     {labels.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                      <div className="px-2 py-1">
                        <div className="flex gap-2 items-center">
                          <Input
                            id="polygon-label"
                            value={draftLabel}
                            onChange={(e) => setDraftLabel(e.target.value)}
                            placeholder="Enter label"
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSaveLabel}
                            disabled={!draftLabel.trim()}
                            variant="secondary"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={onSavePolygon}
                disabled={activePolygon.points.length < 3}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Polygon
              </Button>

              <div>
                <Label className="text-sm font-medium">
                  Points ({activePolygon.points.length})
                </Label>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {activePolygon.points.map((point, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 font-mono"
                    >
                      {index + 1}: ({Math.round(point.x)}, {Math.round(point.y)}
                      )
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Polygons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Saved Polygons ({polygons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {polygons.length === 0 ? (
              <p className="text-gray-500 text-sm">No polygons saved yet</p>
            ) : (
              <div className="space-y-2">
                {polygons.map((polygon) => (
                  <div
                    key={polygon.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPolygonId === polygon.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      onSelectPolygon(
                        selectedPolygonId === polygon.id ? null : polygon.id
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {polygon.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {polygon.points.length} points
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: polygon.color }}
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePolygon(polygon.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
