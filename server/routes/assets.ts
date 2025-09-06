/**
 * Asset Routes - API endpoints para gerenciamento de assets visuais
 *
 * Endpoints:
 * - GET /api/assets/search - Busca e filtra assets
 * - GET /api/assets/:id - Busca asset específico
 * - POST /api/assets - Cria novo asset
 * - PATCH /api/assets/:id - Atualiza asset
 * - DELETE /api/assets/:id - Remove asset
 * - POST /api/assets/:id/favorite - Adiciona aos favoritos
 * - DELETE /api/assets/:id/favorite - Remove dos favoritos
 * - GET /api/assets/favorites - Lista favoritos do usuário
 * - POST /api/assets/collections - Cria coleção
 * - GET /api/assets/collections - Lista coleções do usuário
 * - POST /api/assets/collections/:id/assets - Adiciona asset à coleção
 * - DELETE /api/assets/collections/:id/assets/:assetId - Remove asset da coleção
 * - GET /api/assets/:id/analytics - Analytics do asset
 * - GET /api/assets/trending - Assets em alta
 * - GET /api/assets/:id/similar - Assets similares
 * - POST /api/assets/:id/download - Registra download
 */

import { Router } from "express";
import { assetService } from "../services/asset.service";
import { AssetSearchFilters } from "../services/asset.service";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/assets/search
 * Busca e filtra assets com paginação
 */
router.post("/search", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      query,
      type,
      category,
      format,
      tags,
      colors,
      isPremium,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      maxFileSize,
      sortBy,
      sortOrder,
      page = 1,
      limit = 24
    }: AssetSearchFilters & { page?: number; limit?: number } = req.body;

    const filters: AssetSearchFilters = {
      query,
      type,
      category,
      format,
      tags,
      colors,
      isPremium,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      maxFileSize,
      sortBy,
      sortOrder
    };

    // TODO: Obter userId do contexto de autenticação
    const userId = req.user?.id;

    const result = await assetService.searchAssets(filters, page, limit, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error searching assets:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar assets"
    });
  }
});

/**
 * GET /api/assets/collections
 * Lista coleções do usuário
 */
router.get("/collections", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const collections = await assetService.getUserCollections(userId);

    res.json({
      success: true,
      data: { collections }
    });
  } catch (error) {
    console.error("Error getting collections:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar coleções"
    });
  }
});

/**
 * POST /api/assets/collections
 * Cria nova coleção
 */
router.post("/collections", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, isPublic = false } = req.body;
    const userId = req.user!.id;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Nome da coleção é obrigatório"
      });
    }

    const collection = await assetService.createCollection({
      name: name.trim(),
      description: description?.trim(),
      isPublic,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      data: { collection }
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao criar coleção"
    });
  }
});

/**
 * GET /api/assets/favorites
 * Lista favoritos do usuário
 */
router.get("/favorites", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const assets = await assetService.getUserFavorites(userId);

    res.json({
      success: true,
      data: { assets }
    });
  } catch (error) {
    console.error("Error getting favorites:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar favoritos"
    });
  }
});

/**
 * GET /api/assets/favorites/detailed
 * Lista favoritos do usuário com detalhes completos
 */
router.get("/favorites/detailed", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const assets = await assetService.getUserFavorites(userId);

    res.json({
      success: true,
      data: { assets }
    });
  } catch (error) {
    console.error("Error getting favorites:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar favoritos"
    });
  }
});

/**
 * GET /api/assets/trending
 * Assets em alta
 */
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const assets = await assetService.getTrendingAssets(limit);

    res.json({
      success: true,
      data: { assets }
    });
  } catch (error) {
    console.error("Error getting trending assets:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar assets em alta"
    });
  }
});

/**
 * GET /api/assets/:id
 * Busca asset específico
 */
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const asset = await assetService.getAssetById(id, userId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Asset não encontrado"
      });
    }

    res.json({
      success: true,
      data: { asset }
    });
  } catch (error) {
    console.error("Error getting asset:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar asset"
    });
  }
});

/**
 * POST /api/assets
 * Cria novo asset
 */
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const assetData = req.body;
    const userId = req.user!.id;

    // Adicionar createdBy
    assetData.createdBy = userId;

    const asset = await assetService.createAsset(assetData);

    res.status(201).json({
      success: true,
      data: { asset }
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao criar asset"
    });
  }
});

/**
 * PATCH /api/assets/:id
 * Atualiza asset
 */
router.patch("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;

    const asset = await assetService.updateAsset(id, updates, userId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Asset não encontrado ou sem permissão"
      });
    }

    res.json({
      success: true,
      data: { asset }
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar asset"
    });
  }
});

/**
 * DELETE /api/assets/:id
 * Remove asset
 */
router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const success = await assetService.deleteAsset(id, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Asset não encontrado ou sem permissão"
      });
    }

    res.json({
      success: true,
      message: "Asset removido com sucesso"
    });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao remover asset"
    });
  }
});

/**
 * POST /api/assets/:id/favorite
 * Adiciona asset aos favoritos
 */
router.post("/:id/favorite", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const success = await assetService.addToFavorites(id, userId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Asset já está nos favoritos"
      });
    }

    res.json({
      success: true,
      message: "Asset adicionado aos favoritos"
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao adicionar aos favoritos"
    });
  }
});

/**
 * DELETE /api/assets/:id/favorite
 * Remove asset dos favoritos
 */
router.delete("/:id/favorite", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const success = await assetService.removeFromFavorites(id, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Asset não encontrado nos favoritos"
      });
    }

    res.json({
      success: true,
      message: "Asset removido dos favoritos"
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao remover dos favoritos"
    });
  }
});

/**
 * GET /api/assets/:id/similar
 * Assets similares
 */
router.get("/:id/similar", async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 6;

    const assets = await assetService.getSimilarAssets(id, limit);

    res.json({
      success: true,
      data: { assets }
    });
  } catch (error) {
    console.error("Error getting similar assets:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar assets similares"
    });
  }
});

/**
 * GET /api/assets/:id/analytics
 * Analytics do asset
 */
router.get("/:id/analytics", async (req, res) => {
  try {
    const { id } = req.params;

    const analytics = await assetService.getAssetAnalytics(id);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Error getting asset analytics:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar analytics do asset"
    });
  }
});

/**
 * POST /api/assets/:id/download
 * Registra download do asset
 */
router.post("/:id/download", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await assetService.trackAssetDownload(id, userId);

    res.json({
      success: true,
      message: "Download registrado"
    });
  } catch (error) {
    console.error("Error tracking download:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao registrar download"
    });
  }
});

/**
 * POST /api/assets/:id/view
 * Registra visualização do asset
 */
router.post("/:id/view", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await assetService.trackAssetView(id, userId);

    res.json({
      success: true,
      message: "Visualização registrada"
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao registrar visualização"
    });
  }
});

/**
 * POST /api/assets/collections/:id/assets
 * Adiciona asset à coleção
 */
router.post("/collections/:collectionId/assets", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { collectionId } = req.params;
    const { assetId } = req.body;
    const userId = req.user!.id;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        error: "ID do asset é obrigatório"
      });
    }

    const success = await assetService.addAssetToCollection(collectionId, assetId, userId);

    if (!success) {
      return res.status(403).json({
        success: false,
        error: "Coleção não encontrada ou sem permissão"
      });
    }

    res.json({
      success: true,
      message: "Asset adicionado à coleção"
    });
  } catch (error) {
    console.error("Error adding asset to collection:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao adicionar asset à coleção"
    });
  }
});

/**
 * DELETE /api/assets/collections/:collectionId/assets/:assetId
 * Remove asset da coleção
 */
router.delete("/collections/:collectionId/assets/:assetId", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { collectionId, assetId } = req.params;
    const userId = req.user!.id;

    const success = await assetService.removeAssetFromCollection(collectionId, assetId, userId);

    if (!success) {
      return res.status(403).json({
        success: false,
        error: "Coleção não encontrada ou sem permissão"
      });
    }

    res.json({
      success: true,
      message: "Asset removido da coleção"
    });
  } catch (error) {
    console.error("Error removing asset from collection:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao remover asset da coleção"
    });
  }
});

export default router;