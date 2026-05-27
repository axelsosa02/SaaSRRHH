const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://oybtpkfjvjslheggxdlz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnRwa2ZqdmpzbGhlZ2d4ZGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzM3MzYsImV4cCI6MjA2ODUwOTczNn0.lri_IxvXb7_uyQCxZcs91j8vLJ4cbX2Tmgxo_KQJJUM'
);

async function main() {
    // 1. Insert a dummy candidate
    const dummyId = '11111111-1111-1111-1111-111111111111';
    const { data: inserted, error: insertError } = await supabase
        .from('candidates')
        .insert({
            id: dummyId,
            org_id: '868158d6-6a56-4bdf-87f5-7db8b73f8a00', // some valid-looking UUID format
            nombre: 'InspectColumnsDummy',
            apellido: 'Candidate',
            email: 'inspect_columns_dummy@test.com'
        })
        .select();

    if (insertError) {
        console.error('Insert Error:', insertError);
        return;
    }

    console.log('Inserted candidate:', inserted);
    if (inserted && inserted[0]) {
        console.log('Database columns for candidates table:', Object.keys(inserted[0]));
    }

    // 2. Clean up
    const { error: deleteError } = await supabase
        .from('candidates')
        .delete()
        .eq('id', dummyId);

    if (deleteError) {
        console.error('Delete Error:', deleteError);
    } else {
        console.log('Cleaned up dummy candidate successfully.');
    }
}

main();
