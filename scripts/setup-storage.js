#!/usr/bin/env node

/**
 * Setup script for Supabase Storage buckets
 * Run this script to create the required storage buckets for the application
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage buckets...\n');

  try {
    // Check existing buckets
    console.log('📋 Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const existingBuckets = buckets?.map(b => b.name) || [];
    console.log('📦 Existing buckets:', existingBuckets);

    // Create brand-assets bucket if it doesn't exist
    const bucketName = 'brand-assets';
    const bucketExists = existingBuckets.includes(bucketName);

    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' already exists`);
    } else {
      console.log(`📝 Creating bucket '${bucketName}'...`);

      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);

        if (createError.message.includes('permission') || createError.message.includes('unauthorized') || createError.message.includes('row-level security')) {
          console.log('\n🔐 Permission Error: The anon key cannot create buckets due to Row Level Security.');
          console.log('\n📋 To fix this, create the bucket manually in the Supabase dashboard:');
          console.log('\n   1. Go to: https://supabase.com/dashboard/project/fzknihkqgjkcaoeecxfq/storage');
          console.log('   2. Click "Create bucket"');
          console.log('   3. Enter bucket name: brand-assets');
          console.log('   4. ✅ Check "Public bucket"');
          console.log('   5. Click "Create bucket"');
          console.log('\n   📁 Configure allowed file types:');
          console.log('   - Go to the bucket settings (gear icon)');
          console.log('   - Add these MIME types:');
          console.log('     * image/png');
          console.log('     * image/jpeg');
          console.log('     * image/gif');
          console.log('     * image/webp');
          console.log('     * image/svg+xml');
          console.log('   - Set file size limit to 5MB');
          console.log('\n   ✅ Alternative: Add SERVICE_ROLE_KEY to .env for automatic setup');
          console.log('      Get it from: Project Settings > API > service_role > secret');
        }
      } else {
        console.log(`✅ Bucket '${bucketName}' created successfully`);
      }
    }

    // Verify bucket configuration
    console.log('\n🔍 Verifying bucket configuration...');
    const { data: bucketDetails, error: detailsError } = await supabase.storage.getBucket(bucketName);

    if (detailsError) {
      console.error('❌ Error getting bucket details:', detailsError.message);
    } else {
      console.log('✅ Bucket configuration:');
      console.log(`   - Name: ${bucketDetails.name}`);
      console.log(`   - Public: ${bucketDetails.public}`);
      console.log(`   - Created: ${bucketDetails.created_at}`);
    }

    console.log('\n🎉 Storage setup complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupStorage();