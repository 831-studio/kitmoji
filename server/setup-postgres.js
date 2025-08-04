// Setup script for Vercel Postgres deployment
// This will be run as a build step or initialization script

const { migrateToPostgres } = require('./migrate-to-postgres');

async function setupPostgres() {
  console.log('Setting up Vercel Postgres for production...');
  
  // Check if we're in a Vercel environment
  if (process.env.VERCEL) {
    console.log('Running in Vercel environment, starting migration...');
    
    // Wait a moment for environment variables to be available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await migrateToPostgres();
      console.log('PostgreSQL setup completed successfully!');
    } catch (error) {
      console.error('PostgreSQL setup failed:', error);
      // Don't fail the build if this is an optional setup
      console.log('Continuing with build despite setup failure...');
    }
  } else {
    console.log('Not in Vercel environment, skipping migration');
    console.log('To migrate locally, ensure POSTGRES_URL is set and run: node server/migrate-to-postgres.js');
  }
}

if (require.main === module) {
  setupPostgres().then(() => {
    console.log('Setup script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Setup script failed:', error);
    process.exit(1);
  });
}

module.exports = { setupPostgres };