"use client";

import { useState } from "react";
import { type VitalSigns } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Thermometer, Activity, Wind } from "lucide-react";

interface VitalsInputProps {
  onSubmit: (vitals: VitalSigns) => void;
  onSkip: () => void;
}

export function VitalsInput({ onSubmit, onSkip }: VitalsInputProps) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [spO2, setSpO2] = useState("");

  const handleSubmit = () => {
    const vitals: VitalSigns = {};
    if (systolic && diastolic) {
      vitals.bloodPressureSystolic = parseInt(systolic);
      vitals.bloodPressureDiastolic = parseInt(diastolic);
    }
    if (temperature) vitals.temperature = parseFloat(temperature);
    if (heartRate) vitals.heartRate = parseInt(heartRate);
    if (spO2) vitals.spO2 = parseInt(spO2);
    onSubmit(vitals);
  };

  const hasAnyVital = systolic || diastolic || temperature || heartRate || spO2;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blood Pressure */}
        <div className="p-6 rounded-2xl border-2 border-border bg-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <Label className="text-base font-semibold">Blood Pressure</Label>
              <p className="text-xs text-muted-foreground">mmHg</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Systolic (e.g., 120)"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              min={60}
              max={250}
            />
            <span className="text-xl font-bold text-muted-foreground">/</span>
            <Input
              type="number"
              placeholder="Diastolic (e.g., 80)"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              min={30}
              max={150}
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="p-6 rounded-2xl border-2 border-border bg-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <Label className="text-base font-semibold">Temperature</Label>
              <p className="text-xs text-muted-foreground">Fahrenheit</p>
            </div>
          </div>
          <Input
            type="number"
            placeholder="e.g., 98.6"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            min={90}
            max={110}
            step={0.1}
          />
        </div>

        {/* Heart Rate */}
        <div className="p-6 rounded-2xl border-2 border-border bg-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <Label className="text-base font-semibold">Heart Rate</Label>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
          </div>
          <Input
            type="number"
            placeholder="e.g., 72"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            min={30}
            max={200}
          />
        </div>

        {/* SpO2 */}
        <div className="p-6 rounded-2xl border-2 border-border bg-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Wind className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <Label className="text-base font-semibold">Blood Oxygen (SpO2)</Label>
              <p className="text-xs text-muted-foreground">Percentage</p>
            </div>
          </div>
          <Input
            type="number"
            placeholder="e.g., 98"
            value={spO2}
            onChange={(e) => setSpO2(e.target.value)}
            min={70}
            max={100}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" size="lg" onClick={onSkip} className="flex-1">
          Skip Vitals Check
        </Button>
        <Button
          size="kiosk"
          onClick={handleSubmit}
          disabled={!hasAnyVital}
          className="flex-[2]"
        >
          Submit Vitals & Continue
        </Button>
      </div>
    </div>
  );
}
