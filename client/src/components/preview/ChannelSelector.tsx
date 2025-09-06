import React from 'react';
import { 
  Mail,
  MessageSquare,
  Globe,
  Printer,
  Video,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Check,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  category: 'email' | 'social' | 'web' | 'print' | 'video';
  icon: React.ComponentType<any>;
  description: string;
  specifications: {
    dimensions?: string;
    characterLimits?: {
      title?: number;
      description?: number;
      body?: number;
    };
    features?: string[];
  };
  isActive: boolean;
}

interface ChannelSelectorProps {
  selectedChannel: string;
  onChannelChange: (channelId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const availableChannels: Channel[] = [
  // Email Channels
  {
    id: 'email-newsletter',
    name: 'Newsletter',
    category: 'email',
    icon: Mail,
    description: 'Email newsletter para clientes',
    specifications: {
      characterLimits: {
        title: 60,
        description: 150,
        body: 2000
      },
      features: ['HTML Support', 'Imagens', 'CTAs', 'Personalização']
    },
    isActive: true
  },
  {
    id: 'email-promotional',
    name: 'Email Promocional',
    category: 'email',
    icon: Mail,
    description: 'Campanhas promocionais por email',
    specifications: {
      characterLimits: {
        title: 50,
        description: 120,
        body: 1500
      },
      features: ['Urgência', 'Ofertas', 'Cupons', 'CTA Forte']
    },
    isActive: true
  },

  // Social Media Channels
  {
    id: 'social-instagram-post',
    name: 'Instagram Post',
    category: 'social',
    icon: Instagram,
    description: 'Post no feed do Instagram',
    specifications: {
      dimensions: '1080x1080px',
      characterLimits: {
        description: 2200,
        title: 30
      },
      features: ['Hashtags', 'Stories', 'Visual Focus', 'Engagement']
    },
    isActive: true
  },
  {
    id: 'social-facebook-post',
    name: 'Facebook Post',
    category: 'social',
    icon: Facebook,
    description: 'Post orgânico no Facebook',
    specifications: {
      characterLimits: {
        description: 500,
        title: 25
      },
      features: ['Compartilhamento', 'Comentários', 'Reações', 'Links']
    },
    isActive: true
  },
  {
    id: 'social-linkedin-post',
    name: 'LinkedIn Post',
    category: 'social',
    icon: Linkedin,
    description: 'Post profissional no LinkedIn',
    specifications: {
      characterLimits: {
        description: 1300,
        title: 30
      },
      features: ['Tom Profissional', 'Networking', 'Insights', 'Artigos']
    },
    isActive: true
  },

  // Web Channels
  {
    id: 'web-landing-page',
    name: 'Landing Page',
    category: 'web',
    icon: Globe,
    description: 'Página de conversão',
    specifications: {
      features: ['Conversão', 'SEO', 'Responsivo', 'Analytics']
    },
    isActive: true
  },
  {
    id: 'web-blog-post',
    name: 'Blog Post',
    category: 'web',
    icon: Globe,
    description: 'Artigo para blog',
    specifications: {
      characterLimits: {
        title: 60,
        description: 160,
        body: 5000
      },
      features: ['SEO', 'Engajamento', 'Autoridade', 'Compartilhamento']
    },
    isActive: true
  },

  // Print Channels
  {
    id: 'print-flyer',
    name: 'Flyer',
    category: 'print',
    icon: Printer,
    description: 'Material impresso promocional',
    specifications: {
      dimensions: 'A4 ou A5',
      features: ['Visual Impact', 'Informações Essenciais', 'CTA Clara', 'Contato']
    },
    isActive: true
  },
  {
    id: 'print-brochure',
    name: 'Brochure',
    category: 'print',
    icon: Printer,
    description: 'Folheto institucional',
    specifications: {
      dimensions: 'Tri-fold',
      features: ['Institucional', 'Serviços', 'Credibilidade', 'Portfolio']
    },
    isActive: true
  },

  // Video Channels
  {
    id: 'video-youtube',
    name: 'YouTube',
    category: 'video',
    icon: Youtube,
    description: 'Vídeo para YouTube',
    specifications: {
      dimensions: '1920x1080px',
      characterLimits: {
        title: 100,
        description: 1000
      },
      features: ['Thumbnail', 'Descrição', 'Tags', 'Engajamento']
    },
    isActive: true
  },
  {
    id: 'video-instagram-reel',
    name: 'Instagram Reel',
    category: 'video',
    icon: Video,
    description: 'Vídeo curto para Instagram',
    specifications: {
      dimensions: '1080x1920px',
      characterLimits: {
        description: 2200,
        title: 30
      },
      features: ['Vertical', 'Música', 'Efeitos', 'Trending']
    },
    isActive: true
  }
];

const CategoryIcon = {
  email: Mail,
  social: MessageSquare,
  web: Globe,
  print: Printer,
  video: Video
};

const CategoryColors = {
  email: 'bg-blue-100 text-blue-800 border-blue-200',
  social: 'bg-purple-100 text-purple-800 border-purple-200',
  web: 'bg-green-100 text-green-800 border-green-200',
  print: 'bg-orange-100 text-orange-800 border-orange-200',
  video: 'bg-red-100 text-red-800 border-red-200'
};

const ChannelCard: React.FC<{
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ channel, isSelected, onClick, disabled = false }) => {
  const IconComponent = channel.icon;
  const categoryColor = CategoryColors[channel.category];

  return (
    <button
      onClick={onClick}
      disabled={disabled || !channel.isActive}
      className={`relative w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      } ${
        disabled || !channel.isActive
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      {/* Channel Info */}
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${categoryColor} flex-shrink-0`}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {channel.name}
            </h3>
            {!channel.isActive && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Em breve
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-2">
            {channel.description}
          </p>

          {/* Specifications */}
          <div className="space-y-1">
            {channel.specifications.dimensions && (
              <div className="text-xs text-gray-500">
                <strong>Dimensões:</strong> {channel.specifications.dimensions}
              </div>
            )}
            
            {channel.specifications.characterLimits && (
              <div className="text-xs text-gray-500">
                <strong>Limites:</strong>
                {channel.specifications.characterLimits.title && (
                  <span> Título: {channel.specifications.characterLimits.title}</span>
                )}
                {channel.specifications.characterLimits.description && (
                  <span> • Desc: {channel.specifications.characterLimits.description}</span>
                )}
              </div>
            )}

            {channel.specifications.features && channel.specifications.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {channel.specifications.features.slice(0, 3).map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
                {channel.specifications.features.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{channel.specifications.features.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  selectedChannel,
  onChannelChange,
  loading = false,
  disabled = false
}) => {
  const groupedChannels = availableChannels.reduce((acc, channel) => {
    if (!acc[channel.category]) {
      acc[channel.category] = [];
    }
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  const categories = Object.keys(groupedChannels) as Array<keyof typeof CategoryColors>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Monitor className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">
          Selecionar Canal de Distribuição
        </h3>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const CategoryIconComponent = CategoryIcon[category];
        const channels = groupedChannels[category];
        
        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center space-x-2">
              <CategoryIconComponent className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-700 capitalize">
                {category === 'social' ? 'Redes Sociais' : 
                 category === 'email' ? 'Email Marketing' :
                 category === 'web' ? 'Web' :
                 category === 'print' ? 'Material Impresso' :
                 'Vídeo'}
              </h4>
              <span className="text-xs text-gray-500">
                ({channels.filter(c => c.isActive).length} disponíveis)
              </span>
            </div>

            {/* Channel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {channels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel === channel.id}
                  onClick={() => onChannelChange(channel.id)}
                  disabled={disabled || loading}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Device Preview Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="flex space-x-1 mt-1">
            <Monitor className="w-4 h-4 text-gray-500" />
            <Tablet className="w-4 h-4 text-gray-500" />
            <Smartphone className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Preview Responsivo</p>
            <p>
              O preview será otimizado automaticamente para diferentes dispositivos 
              baseado no canal selecionado. Canais web mostram versões desktop e mobile.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Carregando canais...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelSelector;