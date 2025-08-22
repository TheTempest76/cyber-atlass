declare module 'react-leaflet' {
 import { FC, ReactNode } from 'react';

 type LatLngExpression = number[] | { lat: number; lng: number } | { lat: number; lon: number };
 type LatLngBoundsExpression = LatLngExpression[] | { getNorthEast: () => LatLngExpression; getSouthWest: () => LatLngExpression };

 interface TileLayerProps {
   url: string;
   attribution?: string;
   [key: string]: any;
 }

 interface MarkerProps {
   position: LatLngExpression;
   [key: string]: any;
 }

 interface PopupProps {
   children?: ReactNode;
   [key: string]: any;
 }

 interface MapContainerProps {
   center?: LatLngExpression;
   zoom?: number;
   className?: string;
   bounds?: LatLngBoundsExpression;
   children?: ReactNode;
   [key: string]: any;
 }

 export const TileLayer: FC<TileLayerProps>;
 export const Marker: FC<MarkerProps>;
 export const Popup: FC<PopupProps>;
 export const MapContainer: FC<MapContainerProps>;
}
