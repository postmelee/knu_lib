import { useState, useMemo } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { ParsedSeat } from '../api/types/seat';

interface UseSeatMapLayoutProps {
  seats: ParsedSeat[] | undefined;
  minScale?: number;
  maxScale?: number;
  baseSeatSize?: number;
  mapPadding?: number;
}

export function useSeatMapLayout({
  seats,
  minScale = 1.2,
  maxScale = 1.5,
  baseSeatSize = 32,
  mapPadding = 16,
}: UseSeatMapLayoutProps) {
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

  const onMapContainerLayout = (e: LayoutChangeEvent) => {
    if (!containerSize) {
      setContainerSize({
        width: e.nativeEvent.layout.width,
        height: e.nativeEvent.layout.height,
      });
    }
  };

  const layoutParams = useMemo(() => {
    if (!seats || seats.length === 0) {
      return {
        isReady: false,
        seatScale: minScale,
        seatSize: baseSeatSize,
        mapWidth: 0,
        mapHeight: 0,
        scaledLeft: (raw: number) => 0,
        scaledTop: (raw: number) => 0,
      };
    }

    const minLeft = seats.reduce((min, s) => Math.min(min, s.left), Infinity);
    const minTop = seats.reduce((min, s) => Math.min(min, s.top), Infinity);
    const maxLeft = seats.reduce((max, s) => Math.max(max, s.left), 0);
    const maxTop = seats.reduce((max, s) => Math.max(max, s.top), 0);
    
    const rawWidth = maxLeft - minLeft;
    const rawHeight = maxTop - minTop;

    let dynamicScale = 1.0;
    if (containerSize && rawWidth > 0 && rawHeight > 0) {
      const availableWidth = containerSize.width - mapPadding * 2;
      const availableHeight = containerSize.height - mapPadding * 2;
      
      const scaleX = availableWidth / (rawWidth + baseSeatSize);
      const scaleY = availableHeight / (rawHeight + baseSeatSize);
      
      let fitScale = Math.min(scaleX, scaleY);
      
      if (fitScale < minScale) fitScale = minScale;
      if (fitScale > maxScale) fitScale = maxScale;
      
      dynamicScale = fitScale;
    }
    
    // Default to maxScale initially until layout measurements are known natively
    const finalScale = containerSize ? dynamicScale : maxScale; 
    const finalSize = Math.round(baseSeatSize * finalScale);
    
    const scaledLeft = (raw: number) => Math.round((raw - minLeft) * finalScale) + mapPadding;
    const scaledTop = (raw: number) => Math.round((raw - minTop) * finalScale) + mapPadding;

    const mapWidth = rawWidth > 0 ? Math.round(rawWidth * finalScale) + finalSize + mapPadding * 2 : 1000;
    const mapHeight = rawHeight > 0 ? Math.round(rawHeight * finalScale) + finalSize + mapPadding * 2 : 600;

    return {
      isReady: !!containerSize,
      seatScale: finalScale,
      seatSize: finalSize,
      mapWidth,
      mapHeight,
      scaledLeft,
      scaledTop,
    };
  }, [seats, containerSize, minScale, maxScale, baseSeatSize, mapPadding]);

  return {
    onMapContainerLayout,
    ...layoutParams,
  };
}
