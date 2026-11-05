import {publishedEntries} from '../lib/entries';
import {searchRecord} from '../lib/search';
export async function GET(){
 return new Response(JSON.stringify((await publishedEntries()).map(searchRecord)),{headers:{'Content-Type':'application/json; charset=utf-8'}});
}
