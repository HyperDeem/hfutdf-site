import {publishedEntries} from '../lib/entries';
import {searchRecord} from '../lib/search';
import {subcategoryById} from '../data/subcategories';
export async function GET(){
 return new Response(JSON.stringify((await publishedEntries()).map(entry=>searchRecord(entry,subcategoryById.get(entry.data.subcategory_id??'')?.name))),{headers:{'Content-Type':'application/json; charset=utf-8'}});
}
