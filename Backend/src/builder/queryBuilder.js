/**
 * Firestore-compatible QueryBuilder
 * Usage:
 *   const qb = new QueryBuilder(db.collection('rvs').where('user','==',userId), req.query)
 *     .search(['nickname','model'])
 *     .filter()
 *     .sort()
 *     .paginate();
 *   const { data, meta } = await qb.execute();
 */
class QueryBuilder {
  constructor(collectionRef, query) {
    this._ref = collectionRef;
    this.query = query || {};
    this._searchFields = [];
    this._searchTerm = '';
    this._filters = [];
    this._fromDate = null;
    this._toDate = null;
    this._dateField = 'dateOfService';
    this._sortField = 'createdAt';
    this._sortDir = 'desc';
    this._page = 1;
    this._limit = 10;
  }

  search(searchableFields) {
    this._searchTerm = this.query.searchTerm || '';
    this._searchFields = searchableFields || [];
    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'from', 'to'];
    excludeFields.forEach(el => delete queryObj[el]);

    if (this.query.from && this.query.to) {
      this._fromDate = new Date(this.query.from);
      this._toDate = new Date(this.query.to);
    }

    this._filters = Object.entries(queryObj).map(([key, value]) => ({ key, value }));
    return this;
  }

  sort() {
    const sortStr = this.query.sort || '-createdAt';
    // Support comma-separated but take first only (Firestore limitation)
    const first = sortStr.split(',')[0];
    if (first.startsWith('-')) {
      this._sortField = first.slice(1);
      this._sortDir = 'desc';
    } else {
      this._sortField = first;
      this._sortDir = 'asc';
    }
    return this;
  }

  paginate() {
    this._page = Number(this.query.page) || 1;
    this._limit = Number(this.query.limit) || 10;
    return this;
  }

  // No-op for Firestore (field projection not needed)
  fields() {
    return this;
  }

  async execute() {
    let ref = this._ref;

    // Apply exact match filters via Firestore where()
    for (const { key, value } of this._filters) {
      ref = ref.where(key, '==', value);
    }

    // Date range: only use Firestore orderBy when it's the sole filter to avoid composite index requirement
    if (this._fromDate && this._toDate) {
      ref = ref
        .orderBy(this._dateField)
        .where(this._dateField, '>=', this._fromDate)
        .where(this._dateField, '<=', this._toDate);
    }

    const snap = await ref.get();
    let docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // JS-side search (Firestore has no regex support)
    if (this._searchTerm && this._searchFields.length > 0) {
      const term = this._searchTerm.toLowerCase();
      docs = docs.filter(doc =>
        this._searchFields.some(field => {
          const val = doc[field];
          return val && String(val).toLowerCase().includes(term);
        })
      );
    }

    // JS-side sort (avoids composite index requirement on Firestore)
    docs.sort((a, b) => {
      const av = a[this._sortField] ?? '';
      const bv = b[this._sortField] ?? '';
      if (av < bv) return this._sortDir === 'asc' ? -1 : 1;
      if (av > bv) return this._sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const total = docs.length;
    const skip = (this._page - 1) * this._limit;
    const data = docs.slice(skip, skip + this._limit);
    const totalPage = Math.ceil(total / this._limit);

    return {
      data,
      meta: { page: this._page, limit: this._limit, total, totalPage }
    };
  }
}

module.exports = QueryBuilder;
