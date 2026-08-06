import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import AdminMenuItemModal from '../../components/domain/AdminMenuItemModal';
import { useAdminMenu } from '../../hooks/useAdminMenu';

const availabilityTabs = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'unavailable', label: 'Unavailable' },
];

function formatPrice(amount) {
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function AvailabilityBadge({ isAvailable }) {
  return isAvailable ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-charcoal/5 text-brand-charcoal/50 border border-brand-charcoal/10">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/30" />
      Unavailable
    </span>
  );
}

function MenuItemRow({ item, onEdit, onDelete, deleting }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 py-3">
      {/* Image */}
      <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 bg-brand-cream-2 rounded-xl overflow-hidden relative border border-brand-cream-2/40">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden w-full h-full bg-brand-cream-2 items-center justify-center text-brand-charcoal/30">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zM10.5 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
        </div>

      {/* Name + Category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base font-semibold text-brand-charcoal truncate">{item.name}</p>
        <p className="text-xs text-brand-charcoal/40 mt-0.5">{item.category}</p>
      </div>

      {/* Price */}
      <span className="text-sm md:text-base font-bold text-brand-charcoal tabular-nums flex-shrink-0">
        {formatPrice(item.price)}
      </span>

      {/* Availability (hidden on very small, shown in mobile card) */}
      <div className="hidden sm:block flex-shrink-0">
        <AvailabilityBadge isAvailable={item.isAvailable} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-2 rounded-full text-brand-charcoal/40 hover:text-brand-pink hover:bg-brand-pink/5 transition-colors min-h-[44px] flex items-center"
          aria-label={`Edit ${item.name}`}
          title="Edit"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={deleting}
          className="p-2 rounded-full text-brand-charcoal/40 hover:text-error hover:bg-error/5 transition-colors min-h-[44px] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Delete ${item.name}`}
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function MenuRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-14" />
      <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export default function AdminMenu() {
  const {
    items,
    categories,
    loading,
    error,
    success,
    saving,
    deletingId,
    loadItems,
    loadCategories,
    createItem,
    updateItem,
    deleteItem,
    clearError,
    clearSuccess,
  } = useAdminMenu();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeAvailability, setActiveAvailability] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Initial loads
  useEffect(() => {
    loadItems();
    loadCategories();
  }, [loadItems, loadCategories]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems({
        search: search || undefined,
        category: activeCategory || undefined,
        availability: activeAvailability,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeCategory, activeAvailability, loadItems]);

  const filteredItems = useMemo(() => items, [items]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  const handleSubmit = async (data) => {
    setFormError(null);
    const result = editingItem
      ? await updateItem(editingItem._id, data)
      : await createItem(data);

    if (result && result.success) {
      setModalOpen(false);
      setEditingItem(null);
      // Refresh list to reflect updated data.
      loadItems({
        search: search || undefined,
        category: activeCategory || undefined,
        availability: activeAvailability,
      });
    } else if (result) {
      setFormError(result.message);
    }
  };

  const openDeleteConfirm = (item) => {
    setDeleteTarget(item);
    setDeleteError(null);
  };

  const closeDeleteConfirm = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleteLoading(true);
    const result = await deleteItem(deleteTarget._id);
    setDeleteLoading(false);
    if (result && result.success) {
      setDeleteTarget(null);
    } else if (result) {
      setDeleteError(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-brand-charcoal">
            Menu Management
          </h1>
          <p className="text-sm text-brand-charcoal/50 mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} in the catalog
          </p>
        </div>
        <Button
          className="self-start sm:self-center rounded-full px-5 py-2.5 text-sm font-semibold"
          onClick={openAddModal}
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Item
        </Button>
      </header>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-sm px-4 py-3 rounded-2xl flex items-center justify-between gap-3 animate-fade-in" role="alert">
          <span className="font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </span>
          <button
            type="button"
            onClick={clearSuccess}
            className="text-emerald-700/60 hover:text-emerald-800 transition-colors min-h-[44px] px-2"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center justify-between gap-3 animate-fade-in" role="alert">
          <span className="font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </span>
          <button
            type="button"
            onClick={clearError}
            className="text-rose-700/60 hover:text-rose-800 transition-colors min-h-[44px] px-2"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              id="admin-menu-search"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full px-5"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {availabilityTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveAvailability(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[44px] flex items-center ${
                  activeAvailability === tab.key
                    ? 'bg-brand-charcoal text-white'
                    : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:text-brand-charcoal hover:border-brand-charcoal/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[44px] flex items-center ${
                activeCategory === ''
                  ? 'bg-brand-pink text-white'
                  : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:text-brand-charcoal hover:border-brand-charcoal/20'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory((prev) => (prev === cat ? '' : cat))}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer min-h-[44px] flex items-center ${
                  activeCategory === cat
                    ? 'bg-brand-pink text-white'
                    : 'bg-white text-brand-charcoal/60 border border-brand-charcoal/10 hover:text-brand-charcoal hover:border-brand-charcoal/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtered list */}
      {loading ? (
        <Card className="p-4 border border-brand-cream-2 rounded-2xl divide-y divide-brand-charcoal/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <MenuRowSkeleton key={i} />
          ))}
        </Card>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-cream-2 p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-charcoal/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-charcoal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 12l4.179 2.25m0 0L12 16.5l5.571-2.25m-11.142 0L12 16.5m0 0l5.571-2.25m0-4.5L21.75 12l-4.179 2.25m0-4.5L12 4.5l-5.571 3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-brand-charcoal/50 mb-1">No menu items found</p>
          <p className="text-xs text-brand-charcoal/40">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <Card className="p-2 md:p-4 border border-brand-cream-2 rounded-2xl">
          {/* Desktop table header */}
          <div className="hidden sm:flex items-center gap-4 px-3 py-2 text-[11px] font-bold text-brand-charcoal/30 uppercase tracking-wider border-b border-brand-charcoal/5">
            <div className="w-16 flex-shrink-0" />
            <div className="flex-1">Item</div>
            <div className="w-20 flex-shrink-0 text-right">Price</div>
            <div className="w-24 flex-shrink-0">Status</div>
            <div className="w-24 flex-shrink-0 text-right">Actions</div>
          </div>
          <div className="divide-y divide-brand-charcoal/5">
            {filteredItems.map((item) => (
              <MenuItemRow
                key={item._id}
                item={item}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                deleting={deletingId === item._id}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <AdminMenuItemModal
        isOpen={modalOpen}
        item={editingItem}
        saving={saving}
        error={formError}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteConfirm}
        title="Delete Menu Item"
      >
        <div className="space-y-5">
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-brand-charcoal">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
          </p>

          {deleteError && (
            <div className="bg-rose-50 border border-rose-200/50 text-rose-800 text-sm px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in" role="alert">
              <span className="font-medium">{deleteError}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-3 rounded-full text-sm font-semibold"
              onClick={closeDeleteConfirm}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 py-3 rounded-full text-sm font-semibold bg-error hover:bg-error/90"
              loading={deleteLoading}
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

