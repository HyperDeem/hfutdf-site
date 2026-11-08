import test from 'node:test';
import assert from 'node:assert/strict';
import { createEntrySchema, parseSubcategories } from '../src/content/schema.ts';
import { searchRecord, searchRecords } from '../src/lib/search.ts';

const academic = {id:'physics', category_id:'academic', name:'物理'};
const books = {id:'book-physics', category_id:'books', name:'物理'};
const record = {title:'讲义', category_id:'academic', type:'file'};

test('子分类可选，ID 必须存在且属于资料所在大分类', () => {
  const schema = createEntrySchema(parseSubcategories({subcategories:[academic, books]}));
  assert(schema.safeParse(record).success);
  assert(schema.safeParse({...record, subcategory_id:'physics'}).success);
  for (const id of ['missing', 'book-physics', '', ['physics']]) {
    assert(!schema.safeParse({...record, subcategory_id:id}).success);
  }
  assert(!createEntrySchema([]).safeParse({...record, subcategory_id:'physics'}).success);
});

test('子分类名称仅在同一大分类内唯一，ID 全站唯一', () => {
  assert.equal(parseSubcategories({subcategories:[academic, books]}).length, 2);
  assert.throws(() => parseSubcategories({subcategories:[academic, {...books, category_id:'academic', name:' 物理 '}]}));
  assert.throws(() => parseSubcategories({subcategories:[academic, {...books, id:academic.id}]}));
  assert.throws(() => parseSubcategories({subcategories:[{...academic, id:'../physics'}]}));
});

test('搜索按子分类名称命中，使用稳定 ID 路由和原有锚点', () => {
  const schema = createEntrySchema(parseSubcategories({subcategories:[academic]}));
  const classified = searchRecord({id:'lecture', data:schema.parse({...record, subcategory_id:'physics'})}, '物理');
  const unclassified = searchRecord({id:'notes', data:schema.parse(record)});
  assert.deepEqual(searchRecords([classified, unclassified], '物理'), [classified]);
  assert.equal(classified.href, '/library/academic/physics/#resource-lecture');
  assert.equal(unclassified.href, '/library/academic/#resource-notes');
});
