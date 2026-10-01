import axios from 'axios';
import { pageDefaults } from '../src/admin/pageDefaults';

const API_BASE = 'http://localhost:3001/api';

async function seed() {
  try {
    const res = await axios.get(`${API_BASE}/pages`);
    const pages = res.data;
    console.log(`Found ${pages.length} pages in DB.`);

    for (const page of pages) {
      const slug = page.slug;
      const defaults = pageDefaults[slug];

      if (defaults) {
        console.log(`Syncing defaults for: ${slug}...`);
        try {
          await axios.put(`${API_BASE}/pages/${page.id}`, {
            title: page.title,
            published: page.published,
            pageData: JSON.stringify(defaults)
          });
          console.log(`  ✓ Updated.`);
        } catch (err: any) {
          console.error(`  ✗ Failed to update ${slug}:`, err.message);
        }
      } else {
        console.log(`  ! Skip: No defaults for ${slug}`);
      }
    }
  } catch (err: any) {
    console.error('Seed fatal error:', err.message);
  }
}

seed();
