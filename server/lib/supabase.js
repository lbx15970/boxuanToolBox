const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase 已连接:', SUPABASE_URL);
} else {
  console.log('⚠️ 未配置 Supabase，数据将不会持久化。请在 server/.env 中设置 SUPABASE_URL 和 SUPABASE_KEY。');
}

module.exports = supabase;
