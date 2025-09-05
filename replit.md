# Woof Marketing Platform

## Overview

The Woof Marketing Platform is the first AI-operated pet marketing agency in Brazil, implementing an 80% AI automation + 20% human supervision model. The platform specializes in creating marketing content for veterinary clinics, pet shops, grooming services, and other pet-related businesses while ensuring compliance with veterinary regulations (CFMV/CRMV).

The system generates multi-channel marketing content (Instagram posts, emails, WhatsApp messages, landing pages) using AI, with built-in brand voice consistency, pet industry compliance checking, and automated campaign workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as build tool
- **UI Library**: shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Session-based auth with custom useAuth hook

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express-session with MemoryStore
- **API Design**: RESTful APIs organized by feature domains (auth, campaigns, brand-voice, compliance)

### Database Design
The application uses a PostgreSQL database with the following core entities:
- **Users**: Stores user profiles with business type classification
- **Brand Voices**: AI-generated brand personality profiles with tone, persona, and guidelines
- **Campaigns**: Marketing campaign management with multi-channel support
- **AI Content**: Generated content storage with quality scores and compliance status
- **Compliance Checks**: Regulatory validation results for veterinary content
- **Brand Assets**: Digital asset management for logos and brand materials

### AI Integration Architecture
- **Content Generation**: OpenAI GPT integration for creating pet industry marketing content
- **Brand Voice System**: JSON-based brand personality that influences all AI-generated content
- **Compliance Engine**: Rule-based and AI-powered validation for veterinary regulations
- **Multi-variant Generation**: AI creates 3-5 variations of content with quality scoring

### Authentication & Security
- **Session-based Authentication**: Secure session management with HTTP-only cookies
- **Row Level Security (RLS)**: Database-level access control ensuring users only see their data
- **Business Type Segmentation**: Content and features adapted based on veterinary, pet shop, grooming, or hotel business types

### Content Management System
- **Brand Manual System**: Digital brand guidelines with 15 specialized chapters
- **Asset Management**: Logo upload system with multiple format support (SVG, PNG, JPG, PDF)
- **Campaign Library**: Pre-configured marketing kits for different pet industry scenarios
- **Anamnesis System**: Digital business diagnosis tool for pet companies

## External Dependencies

### Core Infrastructure
- **Supabase**: Database hosting and authentication services (though the current implementation uses custom auth)
- **Neon Database**: PostgreSQL hosting with @neondatabase/serverless driver
- **Vercel/Railway**: Production deployment platform (configured for Node.js apps)

### AI and Content Services
- **OpenAI API**: GPT-4/GPT-3.5 integration for content generation
- **SendGrid**: Email delivery service for marketing campaigns
- **Meta Graph API**: Instagram and Facebook content publishing

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives via shadcn/ui

### Business Integrations
- **WhatsApp Business API**: Automated message sequences
- **Google Business Profile API**: Local business content publishing
- **CFMV/CRMV Compliance**: Brazilian veterinary regulatory compliance checking

The platform is designed to be deployment-ready with proper environment variable configuration for API keys, database connections, and session secrets.