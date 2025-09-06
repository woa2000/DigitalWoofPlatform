/**
 * Tabela de campanhas com performance detalhada
 * 
 * Exibe campanhas com métricas, status, ações e ordenação
 */

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { CampaignPerformance } from '../hooks/usePerformance';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Skeleton } from './ui/skeleton';

type SortField = 'campaignName' | 'status' | 'impressions' | 'engagementRate' | 'conversions' | 'roi' | 'cost' | 'startDate';
type SortDirection = 'asc' | 'desc';

interface CampaignTableProps {
  campaigns: CampaignPerformance[];
  loading?: boolean;
  onViewCampaign?: (campaignId: string) => void;
  onEditCampaign?: (campaignId: string) => void;
  onDeleteCampaign?: (campaignId: string) => void;
  onDuplicateCampaign?: (campaignId: string) => void;
}

export function CampaignTable({
  campaigns,
  loading,
  onViewCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onDuplicateCampaign
}: CampaignTableProps) {
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'campaignName':
          aValue = a.campaignName.toLowerCase();
          bValue = b.campaignName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'impressions':
          aValue = a.metrics.impressions;
          bValue = b.metrics.impressions;
          break;
        case 'engagementRate':
          aValue = a.metrics.engagementRate;
          bValue = b.metrics.engagementRate;
          break;
        case 'conversions':
          aValue = a.metrics.conversions;
          bValue = b.metrics.conversions;
          break;
        case 'roi':
          aValue = a.metrics.roi;
          bValue = b.metrics.roi;
          break;
        case 'cost':
          aValue = a.metrics.cost;
          bValue = b.metrics.cost;
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [campaigns, sortField, sortDirection]);

  // Format values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString('pt-BR');
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'draft':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      case 'completed':
        return 'Finalizada';
      case 'draft':
        return 'Rascunho';
      default:
        return status;
    }
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  // Render trend icon
  const renderTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma campanha encontrada</p>
        <p className="text-sm text-muted-foreground mt-1">
          Ajuste os filtros ou crie uma nova campanha
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('campaignName')}
                  className="h-auto p-0 font-medium"
                >
                  Campanha
                  {renderSortIcon('campaignName')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 font-medium"
                >
                  Status
                  {renderSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('impressions')}
                  className="h-auto p-0 font-medium"
                >
                  Impressões
                  {renderSortIcon('impressions')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('engagementRate')}
                  className="h-auto p-0 font-medium"
                >
                  Engajamento
                  {renderSortIcon('engagementRate')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('conversions')}
                  className="h-auto p-0 font-medium"
                >
                  Conversões
                  {renderSortIcon('conversions')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('roi')}
                  className="h-auto p-0 font-medium"
                >
                  ROI
                  {renderSortIcon('roi')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('cost')}
                  className="h-auto p-0 font-medium"
                >
                  Investimento
                  {renderSortIcon('cost')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('startDate')}
                  className="h-auto p-0 font-medium"
                >
                  Iniciada em
                  {renderSortIcon('startDate')}
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCampaigns.map((campaign) => (
              <TableRow key={campaign.campaignId}>
                <TableCell>
                  <div>
                    <div className="font-medium">{campaign.campaignName}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {campaign.campaignId.slice(0, 8)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(campaign.status)}>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {formatNumber(campaign.metrics.impressions)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {formatPercentage(campaign.metrics.engagementRate)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {formatNumber(campaign.metrics.conversions)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className={
                      campaign.metrics.roi > 0 ? 'text-green-600' : 'text-red-600'
                    }>
                      {formatPercentage(campaign.metrics.roi)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(campaign.metrics.cost)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(campaign.startDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewCampaign && (
                        <DropdownMenuItem onClick={() => onViewCampaign(campaign.campaignId)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                      )}
                      {onEditCampaign && (
                        <DropdownMenuItem onClick={() => onEditCampaign(campaign.campaignId)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onDuplicateCampaign && (
                        <DropdownMenuItem onClick={() => onDuplicateCampaign(campaign.campaignId)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                      )}
                      {onDeleteCampaign && (
                        <DropdownMenuItem 
                          onClick={() => onDeleteCampaign(campaign.campaignId)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Mostrando {sortedCampaigns.length} campainha{sortedCampaigns.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-4">
          <div>
            Ativas: {sortedCampaigns.filter(c => c.status === 'active').length}
          </div>
          <div>
            Pausadas: {sortedCampaigns.filter(c => c.status === 'paused').length}
          </div>
          <div>
            Finalizadas: {sortedCampaigns.filter(c => c.status === 'completed').length}
          </div>
        </div>
      </div>
    </div>
  );
}