"use client";

import { type OTCProduct } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Pill, Info } from "lucide-react";

interface ProductCardProps {
  product: OTCProduct;
  rank: number;
}

export function ProductCard({ product, rank }: ProductCardProps) {
  return (
    <Card className={rank === 1 ? "border-primary border-2 shadow-md" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pill className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{product.genericName}</p>
            </div>
          </div>
          {rank === 1 && (
            <Badge variant="default">Recommended</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dosage */}
        <div className="p-4 rounded-xl bg-success/5 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-success" />
            <span className="font-semibold text-success text-sm">Dosage</span>
          </div>
          <p className="text-sm">{product.dosageAdult}</p>
          {product.dosageChild && (
            <p className="text-xs text-muted-foreground mt-1">Children: {product.dosageChild}</p>
          )}
        </div>

        {/* Warnings */}
        {product.warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="font-semibold text-warning text-sm">Warnings</span>
            </div>
            <ul className="text-sm space-y-1">
              {product.warnings.map((w, i) => (
                <li key={i} className="text-muted-foreground">
                  &bull; {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
