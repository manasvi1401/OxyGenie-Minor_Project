import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Leaf,
  Image as ImageIcon,
} from "lucide-react";

const AIDetection = () => {
  // TEXT STATES
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  // IMAGE STATES
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageResult, setImageResult] = useState<any | null>(null);
  const [imageError, setImageError] = useState("");

  // ---------- TEXT ANALYSIS ----------
  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError("Please enter plant symptoms.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:8000/disease/detect-disease-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symptoms }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Analysis failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- IMAGE ANALYSIS ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImageResult(null);
    setImageError("");

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const analyzeImage = async () => {
    if (!file) {
      setImageError("Please select a leaf image.");
      return;
    }

    setLoadingImage(true);
    setImageError("");
    setImageResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "http://localhost:8000/disease/detect-disease-image",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        throw new Error(
          (data && data.detail) || `HTTP ${res.status} image analysis failed`
        );
      }

      // FastAPI image endpoint returns: { predicted_class, confidence }
      setImageResult(data);
    } catch (err: any) {
      setImageError(
        err.message || "Image analysis failed. Ensure backend is running."
      );
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 🍃 TEXT: Smart Symptom Checker */}
        <Card className="gradient-card border border-border">
          <CardHeader className="flex flex-row items-center gap-4 pb-6">
            <Leaf className="h-12 w-12 text-green-500" />
            <div>
              <CardTitle className="text-3xl">
                🍃 Smart Symptom Checker
              </CardTitle>
              <p className="text-muted-foreground">
                Instant plant disease diagnosis
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: yellow leaves with brown spots and slow growth"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
            />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={analyzeSymptoms}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Analyzing..." : "Analyze Symptoms"}
            </Button>
          </CardContent>
        </Card>

        {/* TEXT RESULT CARDS */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            <Card className="gradient-card border border-border">
              <CardHeader className="flex flex-row items-center gap-3">
                {result.disease.toLowerCase().includes("healthy") ? (
                  <CheckCircle className="text-primary" />
                ) : (
                  <AlertCircle className="text-destructive" />
                )}
                <CardTitle>Diagnosis Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-semibold">{result.disease}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {result.confidence}%
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border border-border">
              <CardHeader>
                <CardTitle>Recommended Treatment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 space-y-1">
                  {result.treatment.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="gradient-card border border-border">
              <CardHeader>
                <CardTitle>Prevention Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc ml-5 space-y-1">
                  {result.prevention.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 🌿 IMAGE-BASED DETECTION (CNN) */}
        <Card className="gradient-card border border-border mt-8">
          <CardHeader className="flex flex-row items-center gap-4 pb-6">
            <ImageIcon className="h-12 w-12 text-blue-500" />
            <div>
              <CardTitle className="text-2xl">
                🌿 Image-based Disease Detection
              </CardTitle>
              <p className="text-muted-foreground">
                Upload a leaf photo to detect disease with CNN
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <input type="file" accept="image/*" onChange={handleFileChange} />

            {preview && (
              <img
                src={preview}
                alt="Leaf preview"
                className="mt-4 max-h-64 rounded border"
              />
            )}

            {imageError && (
              <p className="text-sm text-destructive">{imageError}</p>
            )}

            <Button
              onClick={analyzeImage}
              disabled={loadingImage || !file}
              className="w-full"
            >
              {loadingImage ? "Analyzing Image..." : "Analyze Leaf Image"}
            </Button>
          </CardContent>
        </Card>

        {/* IMAGE RESULT */}
        {imageResult && (
          <Card className="gradient-card border border-border mt-4 animate-fade-in">
            <CardHeader className="flex flex-row items-center gap-3">
              {imageResult.predicted_class
                ?.toLowerCase()
                .includes("healthy") ? (
                <CheckCircle className="text-primary" />
              ) : (
                <AlertCircle className="text-destructive" />
              )}
              <CardTitle>Diagnosis Result (Image)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-semibold">
                {imageResult.predicted_class}
              </p>
              <p className="text-sm text-muted-foreground">
                Confidence: {(imageResult.confidence).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIDetection;
