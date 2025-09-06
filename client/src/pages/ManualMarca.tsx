/**
 * @fileoverview Manual de Marca Digital - Main Page Component
 * Complete manual interface with navigation, routing, and content sections
 * Now integrated with DashboardLayout
 */

import React from 'react';
import { ManualRouter } from '../components/manual/ManualRouter';

interface ManualMarcaPageProps {
  brandId?: string;
}

export default function ManualMarcaPage({ brandId = 'default' }: ManualMarcaPageProps) {
  // Simply return the ManualRouter which will handle all the content
  // The DashboardLayout wrapping is now handled in App.tsx
  return (
    <div className="space-y-6">
      <ManualRouter brandId={brandId} />
    </div>
  );
}

// Export page variants for compatibility
export function ManualMarcaPreviewPage(props: ManualMarcaPageProps) {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <ManualMarcaPage {...props} />
    </div>
  );
}

export function ManualMarcaEmbedPage(props: ManualMarcaPageProps) {
  return (
    <div className="w-full h-full">
      <ManualMarcaPage {...props} />
    </div>
  );
}