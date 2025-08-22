declare module 'leaflet' {
 // Re-export existing types from the @types/leaflet package
 export * from '@types/leaflet';


 // Add additional type definitions for components when used as React components
 import { FC, ReactNode } from 'react';


 // Define types directly to avoid namespace issues
 type LatLngExpression = number[] | { lat: number; lng: number } | { lat: number; lon: number };


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


 // These are needed when components are accessed through the leaflet namespace
 export const TileLayer: FC<TileLayerProps>;
 export const Marker: FC<MarkerProps>;
 export const Popup: FC<PopupProps>;
}