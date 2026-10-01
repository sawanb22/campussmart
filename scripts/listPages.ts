import axios from 'axios';

async function listPages() {
  try {
    const res = await axios.get('http://localhost:3001/api/pages');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('Error fetching pages:', err.message);
  }
}

listPages();
