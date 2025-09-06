/**
 * Página principal da Biblioteca de Assets Visuais
 * 
 * Interface navegável para descoberta, organização e gerenciamento
 * de assets visuais para campanhas de marketing pet
 */

import React from 'react';
import { AssetsLibrary } from '../components/AssetsLibrary';

export default function VisualAssetsLibrary() {
  return (
    <div className="container mx-auto px-4 py-6">
      <AssetsLibrary />
    </div>
  );
}